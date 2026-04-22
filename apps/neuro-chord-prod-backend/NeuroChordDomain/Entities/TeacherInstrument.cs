namespace NeuroChordDomain.Entities;

public class TeacherInstrument
{
    public Guid TeacherId { get; set; } = Guid.NewGuid();
    public TeacherProfile TeacherProfile { get; set; } = null!;
    public Guid InstrumentId { get; set; }
    public Instrument Instrument { get; set; } = null!;
}