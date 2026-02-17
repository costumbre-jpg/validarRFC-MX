using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using ValidaRFC.Models;

namespace ValidaRFC.Controllers;

[ApiController]
[Route("api")]
public class ValidationController : ControllerBase
{
    private static readonly Regex RfcPattern = new(@"^[A-ZÑ&]{3,4}\d{6}(?:[A-Z0-9]{3})?$");

    [HttpGet("health")]
    public ActionResult<HealthResponse> Health()
    {
        return Ok(new HealthResponse { Timestamp = DateTime.UtcNow });
    }

    [HttpPost("validate")]
    public ActionResult<ValidationResponse> Validate([FromBody] ValidationRequest request)
    {
        var rfc = request.Rfc.ToUpper().Trim();
        var isValid = RfcPattern.IsMatch(rfc);

        return Ok(new ValidationResponse
        {
            Rfc = rfc,
            IsValid = isValid,
            CreatedAt = DateTime.UtcNow
        });
    }
}
