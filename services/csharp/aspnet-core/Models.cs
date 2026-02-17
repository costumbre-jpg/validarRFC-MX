using System.Text.RegularExpressions;

namespace ValidaRFC.Models;

public class ValidationRequest
{
    public string Rfc { get; set; } = string.Empty;
}

public class ValidationResponse
{
    public string Rfc { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class HealthResponse
{
    public string Status { get; set; } = "ok";
    public DateTime Timestamp { get; set; }
}
