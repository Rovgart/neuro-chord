using System.Linq.Expressions;

namespace NeuroChord.Application.Interfaces;

public interface IBackgroundJobService
{
    void Enqueue(Expression<Action> methodCall);
}