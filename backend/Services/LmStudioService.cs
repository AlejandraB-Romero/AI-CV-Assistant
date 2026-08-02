using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AI.CV.Assistant.Backend.Services
{
    public interface ILmStudioService
    {
        Task<string> GenerateCompletionAsync(string prompt);
    }

    public class LmStudioService : ILmStudioService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public LmStudioService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _baseUrl = config["AiServices:LmStudioUrl"] ?? "http://localhost:1234/v1";
        }

        public async Task<string> GenerateCompletionAsync(string prompt)
        {
            var payload = new
            {
                model = "prism-ml/bonsai-27b",
                messages = new[]
                {
                    new { role = "system", content = "Eres un experto auditor de CVs e IA para selección de personal. Devuelve las respuestas en formato JSON estructurado." },
                    new { role = "user", content = prompt }
                },
                temperature = 0.2
            };

            var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_baseUrl}/chat/completions", content);

            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(responseBody);

            return json["choices"]?[0]?["message"]?["content"]?.ToString() ?? string.Empty;
        }
    }
}