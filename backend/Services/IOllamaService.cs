namespace AI.CV.Assistant.Backend.Services
{
    public interface IOllamaService
    {
        Task<string> GenerateAsync(string model, string prompt);
        Task<bool> CheckHealthAsync();
    }
}