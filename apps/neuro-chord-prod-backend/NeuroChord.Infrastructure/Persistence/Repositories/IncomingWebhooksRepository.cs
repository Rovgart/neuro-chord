using Microsoft.EntityFrameworkCore;
using NeuroChord.Infrastructure.Interfaces;
using NeuroChordDomain.Entities;

namespace NeuroChord.Infrastructure.Persistence.Repositories;

public class IncomingWebhooksRepository(AppDbContext context) : IIncomingWebhooksRepository
{
    public async Task AddAsync(IncomingWebhooks incomingWebhooks)
    {
        await context.IncomingWebhooks.AddAsync(incomingWebhooks);
    }

    public async Task<bool> FindAsync(string stripeEventId)
    {
        return await context.IncomingWebhooks.AnyAsync(iw => iw.ExternalEventId == stripeEventId);
    }
}