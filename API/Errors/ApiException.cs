namespace API.Errors
{
    public class ApiException
    {
        public ApiException(int statusCpde, string message, string details)
        {
            StatusCpde = statusCpde;
            Message = message;
            Details = details;
        }

        public int StatusCpde { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
    }
}