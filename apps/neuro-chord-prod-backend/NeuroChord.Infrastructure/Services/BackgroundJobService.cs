using System.Linq.Expressions;
using Hangfire;
using NeuroChord.Application.Interfaces;

namespace NeuroChord.Infrastructure.Services;

public class BackgroundJobService : IBackgroundJobService
{
    public void Enqueue<T>(Expression<Func<T, Task>> methodCall)
    {
        BackgroundJob.Enqueue(methodCall);
    }
}