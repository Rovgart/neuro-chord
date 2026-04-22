using NeuroChordDomain.Enums;

namespace NeuroChordDomain.Entities;

public class Group
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StudentId { get; set; }
    public Guid TeacherId { get; set; }
    public Guid InstrumentId { get; set; }
    public AdvanceLevel AdvanceLevel { get; set; }
    public Instrument Instrument { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}