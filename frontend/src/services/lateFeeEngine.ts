/**
 * lateFeeEngine.ts — High-Efficiency Late Fee Calculation Engine
 * 
 * Provides centralized, mathematically accurate calculation of late penalties
 * for ROVIA rental contracts with configurable grace periods, multi-tier daily multipliers,
 * flat administrative handling fees, and security deposit protection caps.
 */

import { Order } from './mockData';

export interface LateFeeRules {
  gracePeriodHours: number;        // e.g. 4 hours grace before penalty begins
  hourlyRateMultiplier: number;    // e.g. 1.25x pro-rated hourly rate for partial days (<24h)
  dailyMultiplierTier1: number;    // e.g. 1.5x daily rate for overdue days 1 to 3
  dailyMultiplierTier2: number;    // e.g. 2.0x daily rate for overdue days 4 and beyond
  adminHandlingFee: number;        // Flat surcharge for late logistics/re-scheduling (e.g. ₹500)
  maxDepositCapPct: number;        // Max penalty cannot exceed this % of held security deposit (e.g. 100%)
}

export const DEFAULT_LATE_FEE_RULES: LateFeeRules = {
  gracePeriodHours: 4,
  hourlyRateMultiplier: 1.25,
  dailyMultiplierTier1: 1.5,
  dailyMultiplierTier2: 2.0,
  adminHandlingFee: 500,
  maxDepositCapPct: 100,
};

const RULES_STORAGE_KEY = 'rovia_late_fee_rules';

/**
 * Retrieve active late fee rules from localStorage with safe fallback defaults.
 */
export function getLateFeeRules(): LateFeeRules {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_LATE_FEE_RULES, ...parsed };
    }
  } catch (err) {
    console.warn('Could not read late fee rules from storage, using defaults:', err);
  }
  return DEFAULT_LATE_FEE_RULES;
}

/**
 * Save updated late fee rules system-wide to localStorage.
 */
export function saveLateFeeRules(rules: LateFeeRules): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to persist late fee rules:', err);
  }
}

export interface TierBreakdownItem {
  name: string;
  units: number;
  unitType: 'hours' | 'days';
  rateApplied: number;
  subtotal: number;
}

export interface LateFeeCalculationResult {
  isOverdue: boolean;
  inGracePeriod: boolean;
  rawMinutesOverdue: number;
  hoursOverdue: number;
  daysOverdue: number;
  gracePeriodHours: number;
  chargeableHours: number;
  chargeableDays: number;
  tiers: TierBreakdownItem[];
  adminFee: number;
  subtotalBeforeCap: number;
  maxDepositCap: number;
  isCapped: boolean;
  finalPenalty: number;
  depositAmount: number;
  deductedFromDeposit: number;
  remainingDeposit: number;
  extraPayableByCustomer: number;
  rulesApplied: LateFeeRules;
}

/**
 * Pure, high-efficiency calculation of late fees.
 * 
 * @param expectedReturn - Expected return ISO string or Date (e.g., '2026-08-05' or '2026-08-05T18:00:00')
 * @param actualOrCurrent - Actual return ISO string/Date, defaults to now
 * @param dailyRate - Base daily rate in ₹
 * @param depositAmount - Refundable deposit amount held in ₹
 * @param customRules - Optional custom rule overrides
 */
export function calculateLateFee(
  expectedReturn: string | Date,
  actualOrCurrent: string | Date = new Date(),
  dailyRate: number,
  depositAmount: number,
  customRules?: Partial<LateFeeRules>
): LateFeeCalculationResult {
  const rules: LateFeeRules = { ...getLateFeeRules(), ...(customRules || {}) };

  // Parse dates cleanly
  const expDate = typeof expectedReturn === 'string' 
    ? new Date(expectedReturn.includes('T') ? expectedReturn : `${expectedReturn}T18:00:00`)
    : expectedReturn;

  const actDate = typeof actualOrCurrent === 'string'
    ? new Date(actualOrCurrent.includes('T') ? actualOrCurrent : `${actualOrCurrent}T18:00:00`)
    : actualOrCurrent;

  const diffMs = actDate.getTime() - expDate.getTime();

  if (diffMs <= 0 || dailyRate <= 0) {
    return {
      isOverdue: false,
      inGracePeriod: false,
      rawMinutesOverdue: 0,
      hoursOverdue: 0,
      daysOverdue: 0,
      gracePeriodHours: rules.gracePeriodHours,
      chargeableHours: 0,
      chargeableDays: 0,
      tiers: [],
      adminFee: 0,
      subtotalBeforeCap: 0,
      maxDepositCap: Math.round((depositAmount * rules.maxDepositCapPct) / 100),
      isCapped: false,
      finalPenalty: 0,
      depositAmount,
      deductedFromDeposit: 0,
      remainingDeposit: depositAmount,
      extraPayableByCustomer: 0,
      rulesApplied: rules,
    };
  }

  const rawMinutes = Math.floor(diffMs / (1000 * 60));
  const rawHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Check if within grace window
  if (rawHours <= rules.gracePeriodHours) {
    return {
      isOverdue: true,
      inGracePeriod: true,
      rawMinutesOverdue: rawMinutes,
      hoursOverdue: rawHours,
      daysOverdue: 0,
      gracePeriodHours: rules.gracePeriodHours,
      chargeableHours: 0,
      chargeableDays: 0,
      tiers: [
        {
          name: `Grace Period Waiver (${rules.gracePeriodHours}h window)`,
          units: rawHours,
          unitType: 'hours',
          rateApplied: 0,
          subtotal: 0,
        },
      ],
      adminFee: 0,
      subtotalBeforeCap: 0,
      maxDepositCap: Math.round((depositAmount * rules.maxDepositCapPct) / 100),
      isCapped: false,
      finalPenalty: 0,
      depositAmount,
      deductedFromDeposit: 0,
      remainingDeposit: depositAmount,
      extraPayableByCustomer: 0,
      rulesApplied: rules,
    };
  }

  // Chargeable time beyond grace window
  const chargeableHours = rawHours - rules.gracePeriodHours;
  const tiers: TierBreakdownItem[] = [];
  let penaltyAccrued = 0;

  // Pro-rated hourly rate
  const proRatedHourly = Math.round((dailyRate / 24) * rules.hourlyRateMultiplier);

  if (chargeableHours < 24) {
    // Under 24h overdue: charged hourly
    const hourlySubtotal = chargeableHours * proRatedHourly;
    tiers.push({
      name: `Minor Delay Hourly Charge (${rules.hourlyRateMultiplier}x pro-rated rate)`,
      units: chargeableHours,
      unitType: 'hours',
      rateApplied: proRatedHourly,
      subtotal: hourlySubtotal,
    });
    penaltyAccrued += hourlySubtotal;
  } else {
    // 24h or more: charged by full overdue days
    const chargeableDays = Math.ceil(chargeableHours / 24);

    // Tier 1: Days 1 to 3
    const tier1Days = Math.min(chargeableDays, 3);
    const tier1Rate = Math.round(dailyRate * rules.dailyMultiplierTier1);
    const tier1Subtotal = tier1Days * tier1Rate;
    tiers.push({
      name: `Tier 1 Late Daily Rate (Days 1–3 at ${rules.dailyMultiplierTier1}x)`,
      units: tier1Days,
      unitType: 'days',
      rateApplied: tier1Rate,
      subtotal: tier1Subtotal,
    });
    penaltyAccrued += tier1Subtotal;

    // Tier 2: Days 4+
    if (chargeableDays > 3) {
      const tier2Days = chargeableDays - 3;
      const tier2Rate = Math.round(dailyRate * rules.dailyMultiplierTier2);
      const tier2Subtotal = tier2Days * tier2Rate;
      tiers.push({
        name: `Tier 2 Escalated Late Daily Rate (Days 4+ at ${rules.dailyMultiplierTier2}x)`,
        units: tier2Days,
        unitType: 'days',
        rateApplied: tier2Rate,
        subtotal: tier2Subtotal,
      });
      penaltyAccrued += tier2Subtotal;
    }
  }

  // Administrative logistics rescheduling fee
  const adminFee = rules.adminHandlingFee;
  if (adminFee > 0) {
    tiers.push({
      name: 'Administrative Logistics & Re-scheduling Surcharge',
      units: 1,
      unitType: 'days',
      rateApplied: adminFee,
      subtotal: adminFee,
    });
    penaltyAccrued += adminFee;
  }

  // Security Deposit Cap Check
  const maxDepositCap = Math.round((depositAmount * rules.maxDepositCapPct) / 100);
  const isCapped = maxDepositCap > 0 && penaltyAccrued > maxDepositCap;
  const finalPenalty = isCapped ? maxDepositCap : penaltyAccrued;

  // Deposit deduction calculation
  const deductedFromDeposit = Math.min(finalPenalty, depositAmount);
  const remainingDeposit = Math.max(0, depositAmount - deductedFromDeposit);
  const extraPayableByCustomer = Math.max(0, finalPenalty - depositAmount);

  return {
    isOverdue: true,
    inGracePeriod: false,
    rawMinutesOverdue: rawMinutes,
    hoursOverdue: rawHours,
    daysOverdue,
    gracePeriodHours: rules.gracePeriodHours,
    chargeableHours,
    chargeableDays: Math.ceil(chargeableHours / 24),
    tiers,
    adminFee,
    subtotalBeforeCap: penaltyAccrued,
    maxDepositCap,
    isCapped,
    finalPenalty,
    depositAmount,
    deductedFromDeposit,
    remainingDeposit,
    extraPayableByCustomer,
    rulesApplied: rules,
  };
}

/**
 * Dynamically evaluate an Order's overdue status against its rentalWindow.end.
 * Updates daysOverdue and estimatedPenalty using the centralized rules engine.
 */
export function evaluateOrderOverdue(order: Order, rules?: LateFeeRules): Order {
  // If already returned, completed, or cancelled, do not alter
  if (['Completed', 'Cancelled'].includes(order.status)) {
    return order;
  }

  const dailyRate = Math.max(1, Math.round(order.rentalFee / (order.rentalWindow.days || 1)));
  const result = calculateLateFee(
    order.rentalWindow.end,
    new Date(),
    dailyRate,
    order.depositAmount,
    rules
  );

  if (result.isOverdue && !result.inGracePeriod) {
    return {
      ...order,
      status: order.status === 'Active' || order.status === 'Upcoming' ? 'Overdue' : order.status,
      daysOverdue: result.daysOverdue,
      estimatedPenalty: result.finalPenalty,
    };
  }

  return order;
}
