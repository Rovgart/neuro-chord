using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Interfaces;

public interface IIncomingWebhooksRepository
{
    Task AddAsync(IncomingWebhooks incomingWebhooks);

    Task<bool> FindAsync(string stripeEventId);
}