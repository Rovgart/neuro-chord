namespace NeuroChordDomain.Entities;

public class Instrument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; }
    public Instrument Type { get; set; }
    public virtual ICollection<TeacherInstrument> TeacherInstruments { get; set; } = new List<TeacherInstrument>();
}