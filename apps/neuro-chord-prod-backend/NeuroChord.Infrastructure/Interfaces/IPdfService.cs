namespace NeuroChord.Infrastructure.Interfaces;

public interface IPdfService
{
    string ExtractText(Stream pdfStream);
}