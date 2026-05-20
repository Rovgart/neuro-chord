namespace NeuroChord.Application.Common;
// lub odpowiedni namespace dla modeli biznesowych

public class SelectPlanResult
{
    private SelectPlanResult()
    {
    }

    // Właściwości informacyjne dla kontrolera
    public bool IsFreePlan { get; private set; }
    public string? StripeCheckoutUrl { get; private set; }
    public string? NewToken { get; private set; }
    public string? RefreshToken { get; private set; }

    public static SelectPlanResult SuccessFree(string token, string refreshToken)
    {
        return new SelectPlanResult
        {
            IsFreePlan = true,
            NewToken = token,
            RefreshToken = refreshToken,
            StripeCheckoutUrl = null
        };
    }

    public static SelectPlanResult RequiresPayment(string checkoutUrl)
    {
        return new SelectPlanResult
        {
            IsFreePlan = false,
            StripeCheckoutUrl = checkoutUrl,
            NewToken = null,
            RefreshToken = null
        };
    }
}