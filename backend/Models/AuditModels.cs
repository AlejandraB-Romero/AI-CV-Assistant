namespace AI.CV.Assistant.Backend.Models
{
    public class AuditRequestDto
    {
        public string CvText { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Concurrency { get; set; } = 2;
    }

    public class AgentResultDto
    {
        public string Agent { get; set; } = string.Empty;
        public int Score { get; set; }
        public string Summary { get; set; } = string.Empty;
        public List<string> Strengths { get; set; } = new();
        public List<string> Weaknesses { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
    }

    public class AuditResponseDto
    {
        public int GlobalScore { get; set; }
        public double TotalDuration { get; set; }
        public string FinalSummaryText { get; set; } = string.Empty;
        public Dictionary<string, AgentResultDto> Results { get; set; } = new();
    }
}