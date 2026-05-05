using System.Linq.Expressions;

namespace NeuroChord.Application.Interfaces;

public interface IBackgroundJobService
{
    void Enqueue<T>(Expression<Func<T, Task>> methodCall);
}