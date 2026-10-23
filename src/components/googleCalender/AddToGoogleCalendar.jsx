'use client';

export default function AddToCalendar(eventDetails) {
  const event = {
    title:
      eventDetails.title ??
      'TEST - Prayer Meeting – Remembering Late Vd. Shailesh Nadkarni',
    description:
      eventDetails.shortDescription ??
      'TEST - Prayer meeting in remembrance of Late Vd. Shailesh Nadkarni.',
    location:
      eventDetails.address ??
      'TEST - Yogi Sabhagruha, Dadar (East), next to BAPS Shri Swaminarayan Mandir, Mumbai – 400014, India',
    start: eventDetails.startDate ?? '20260109T140000',
    end: eventDetails.endDate ?? '20260109T170000',
  };

  // Encode helper
  const encode = (str) => encodeURIComponent(str);

  // Google Calendar
  const googleUrl = () =>
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encode(
      event.title
    )}&dates=${event.start}/${event.end}&details=${encode(
      event.description
    )}&location=${encode(event.location)}`;

  // Outlook Web
  const outlookUrl = () =>
    `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encode(
      event.title
    )}&body=${encode(event.description)}&location=${encode(
      event.location
    )}&startdt=${event.start}&enddt=${event.end}`;

  // Yahoo Calendar
  const yahooUrl = () =>
    `https://calendar.yahoo.com/?v=60&title=${encode(
      event.title
    )}&st=${event.start}&et=${event.end}&desc=${encode(
      event.description
    )}&in_loc=${encode(event.location)}`;

  // Apple / iCal (ICS file)
  const downloadICS = () => {
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:${event.start}
DTEND:${event.end}
END:VEVENT
END:VCALENDAR`.trim();

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'event.ics';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <details>
        <summary
          style={{
            listStyle: 'none',
            cursor: 'pointer',
            padding: '10px 16px',
            background: '#1a73e8',
            color: '#fefefe',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Add to Calendar
        </summary>

        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            background: '#fefefe',
            border: '1px solid #ddd',
            borderRadius: '6px',
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <a href={googleUrl()} target="_blank" className="calendar-item">
            Google Calendar
          </a>
          <a href={outlookUrl()} target="_blank" className="calendar-item">
            Outlook
          </a>
          <a href={yahooUrl()} target="_blank" className="calendar-item">
            Yahoo Calendar
          </a>
          <button onClick={downloadICS} className="calendar-item">
            Apple / iCal
          </button>
        </div>
      </details>

      <style jsx>{`
        .calendar-item {
          display: block;
          padding: 10px 14px;
          font-size: 14px;
          color: #333;
          text-decoration: none;
          background: white;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .calendar-item:hover {
          background: #f2f2f2;
        }

        summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </div>
  );
}
