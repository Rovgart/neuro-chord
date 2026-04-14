using System.Linq.Expressions;
using Hangfire;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Infrastructure.Services;

public class BackgroundJobService : IBackgroundJobService
{
    public void Enqueue(Expression<Action> methodCall)
    {
        BackgroundJob.Enqueue(methodCall);
    }
}