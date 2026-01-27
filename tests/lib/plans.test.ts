import { getPlan, getActivePlans, getPlanValidationLimit, getPlanApiLimit, planHasFeature } from "@/lib/plans";

describe("Plans Utilities", () => {
  describe("getPlan", () => {
    it("should return plan configuration for valid plan IDs", () => {
      const proPlan = getPlan("pro");
      expect(proPlan.id).toBe("pro");
      expect(proPlan.monthlyPrice).toBe(299);
      expect(proPlan.validationsPerMonth).toBe(1000);
    });

    it("should return business plan configuration", () => {
      const businessPlan = getPlan("business");
      expect(businessPlan.id).toBe("business");
      expect(businessPlan.monthlyPrice).toBe(999);
      expect(businessPlan.validationsPerMonth).toBe(5000);
    });

    it("should return free plan configuration", () => {
      const freePlan = getPlan("free");
      expect(freePlan.id).toBe("free");
      expect(freePlan.monthlyPrice).toBe(0);
      expect(freePlan.validationsPerMonth).toBe(10);
    });
  });

  describe("getActivePlans", () => {
    it("should return only active plans", () => {
      const activePlans = getActivePlans();
      const planIds = activePlans.map((p) => p.id);
      
      expect(planIds).toContain("free");
      expect(planIds).toContain("pro");
      expect(planIds).toContain("business");
      expect(planIds.length).toBe(3);
    });
  });

  describe("getPlanValidationLimit", () => {
    it("should return correct validation limit for each plan", () => {
      expect(getPlanValidationLimit("free")).toBe(10);
      expect(getPlanValidationLimit("pro")).toBe(1000);
      expect(getPlanValidationLimit("business")).toBe(5000);
    });

    it("should return -1 for unlimited plans", () => {
      expect(getPlanValidationLimit("enterprise")).toBe(-1);
    });
  });

  describe("getPlanApiLimit", () => {
    it("should return correct API limit for each plan", () => {
      expect(getPlanApiLimit("free")).toBe(0);
      expect(getPlanApiLimit("pro")).toBe(2000);
      expect(getPlanApiLimit("business")).toBe(10000);
    });

    it("should return -1 for unlimited API plans", () => {
      expect(getPlanApiLimit("enterprise")).toBe(-1);
    });
  });

  describe("planHasFeature", () => {
    it("should correctly identify plan features", () => {
      expect(planHasFeature("free", "history")).toBe(false);
      expect(planHasFeature("pro", "history")).toBe(true);
      expect(planHasFeature("business", "history")).toBe(true);

      expect(planHasFeature("free", "export")).toBe(false);
      expect(planHasFeature("pro", "export")).toBe(true);
      expect(planHasFeature("business", "export")).toBe(true);

      expect(planHasFeature("free", "whiteLabel")).toBe(false);
      expect(planHasFeature("pro", "whiteLabel")).toBe(false);
      expect(planHasFeature("business", "whiteLabel")).toBe(true);
    });

    it("should handle numeric features correctly", () => {
      expect(planHasFeature("free", "apiKeys")).toBe(false);
      expect(planHasFeature("pro", "apiKeys")).toBe(true); // 5 > 0
      expect(planHasFeature("business", "apiKeys")).toBe(true); // 20 > 0
    });

    it("should handle string features correctly", () => {
      expect(planHasFeature("free", "api")).toBe(false);
      expect(planHasFeature("pro", "api")).toBe(true); // "Básica" is truthy
      expect(planHasFeature("business", "api")).toBe(true); // "Completa" is truthy
    });
  });
});
