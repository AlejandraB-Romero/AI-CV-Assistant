using AI.CV.Assistant.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace AI.CV.Assistant.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly IOllamaService _ollamaService;

        public HealthController(IOllamaService ollamaService)
        {
            _ollamaService = ollamaService;
        }

        [HttpGet("ollama")]
        public async Task<IActionResult> GetOllamaStatus()
        {
            var isOnline = await _ollamaService.CheckHealthAsync();
            return Ok(new { online = isOnline, timestamp = DateTime.UtcNow });
        }
    }
}