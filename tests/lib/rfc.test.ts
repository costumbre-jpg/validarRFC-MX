import { validateRFC, normalizeRFC, isValidRFCFormatStrict } from "@/lib/rfc";

describe("RFC Utilities", () => {
  describe("normalizeRFC", () => {
    it("should remove spaces and convert to uppercase", () => {
      expect(normalizeRFC("xaxx 0101 0100 0")).toBe("XAXX010101000");
      expect(normalizeRFC("abc123456789")).toBe("ABC123456789");
    });

    it("should handle already normalized RFCs", () => {
      expect(normalizeRFC("XAXX010101000")).toBe("XAXX010101000");
    });

    it("should handle empty strings", () => {
      expect(normalizeRFC("")).toBe("");
    });
  });

  describe("isValidRFCFormatStrict", () => {
    it("should validate correct RFC personas físicas", () => {
      expect(isValidRFCFormatStrict("XAXX010101000")).toBe(true);
      expect(isValidRFCFormatStrict("ABCD123456E12")).toBe(true);
    });

    it("should validate correct RFC personas morales", () => {
      expect(isValidRFCFormatStrict("ABC123456789")).toBe(true);
      expect(isValidRFCFormatStrict("XYZ987654321")).toBe(true);
    });

    it("should reject RFCs that are too short", () => {
      expect(isValidRFCFormatStrict("XAXX01010100")).toBe(false); // 12 chars (needs 13 for PF)
      expect(isValidRFCFormatStrict("ABC12345678")).toBe(false); // 11 chars (needs 12 for PM)
    });

    it("should reject RFCs that are too long", () => {
      expect(isValidRFCFormatStrict("XAXX0101010000")).toBe(false); // 14 chars
      expect(isValidRFCFormatStrict("ABC1234567890")).toBe(false); // 13 chars for PM
    });

    it("should reject invalid formats", () => {
      expect(isValidRFCFormatStrict("123456789012")).toBe(false); // All numbers
      expect(isValidRFCFormatStrict("ABCDEFGHIJKL")).toBe(false); // All letters
      expect(isValidRFCFormatStrict("XAXX01010100A")).toBe(false); // Invalid last char
    });

    it("should handle empty strings", () => {
      expect(isValidRFCFormatStrict("")).toBe(false);
    });
  });

  describe("validateRFC", () => {
    // Mock fetch for SAT validation
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("should return valid result for valid RFC from SAT", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => "Vigente|PUBLICO EN GENERAL|",
      });

      const result = await validateRFC("XAXX010101000");

      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.name).toBe("PUBLICO EN GENERAL");
      expect(result.status).toBe("Vigente");
    });

    it("should return invalid result for non-existent RFC", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => "No Encontrado||",
      });

      const result = await validateRFC("ABCD123456789");

      expect(result.success).toBe(true);
      expect(result.valid).toBe(false);
    });

    it("should handle SAT API errors gracefully", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const result = await validateRFC("XAXX010101000");

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("Error");
    });

    it("should handle invalid RFC format before calling SAT", async () => {
      const result = await validateRFC("INVALID");

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.message).toContain("formato");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
