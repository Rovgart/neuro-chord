using System.Text;
using NeuroChord.Infrastructure.Interfaces;
using UglyToad.PdfPig;

namespace NeuroChord.Infrastructure.Services;

public class PdfService : IPdfService
{
    public string ExtractText(Stream pdfStream)
    {
        using var document = PdfDocument.Open(pdfStream);
        var text = new StringBuilder();
        foreach (var page in document.GetPages()) text.AppendLine(page.Text);
        return text.ToString();
    }
}