using System.Text;
using Newtonsoft.Json;

namespace AI.CV.Assistant.Backend.Services
{
    public class OllamaService : IOllamaService
    {
        private readonly HttpClient _httpClient;

        public OllamaService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("http://localhost:11434/");
            _httpClient.Timeout = TimeSpan.FromMinutes(3);
        }

        public async Task<bool> CheckHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("api/tags");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> GenerateAsync(string model, string prompt)
        {
            var requestBody = new
            {
                model = string.IsNullOrEmpty(model) ? "llama3:latest" : model,
                prompt = prompt,
                stream = false
            };

            var jsonContent = new StringContent(
                JsonConvert.SerializeObject(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync("api/generate", jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Ollama devolvió un estado HTTP {response.StatusCode}. Verifica el nombre del modelo o que Ollama esté ejecutándose.");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            dynamic json = JsonConvert.DeserializeObject(responseString)!;
            return json.response;
        }
    }
}