namespace NeuroChord.Application.DTOs;

public record InvoiceDto(
    string Id,
    long AmountPaid,
    string Currency,
    string Status,
    string HostedInvoiceUrl,
    string InvoicePdf,
    DateTime Created
);