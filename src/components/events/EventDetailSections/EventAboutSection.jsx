'use client';

import { RiInformationLine } from 'react-icons/ri';

const EventAboutSection = ({ eventData }) => {
  const description = eventData.event?.description;

  if (!description) return null;

  const isHtml = /<\w[\s\S]*>/.test(description);

  return (
    <>
      {isHtml ? (
        <section className="event-about-section">
          <div className="event-section-card">
            <div className="event-section-header">
              <span className="event-section-indicator" />
              <h2 className="section-title">
                <span className="icon">
                  <RiInformationLine />
                </span>{' '}
                About the Event
              </h2>
            </div>

            <div className="event-about-content">
              <div className="about-text">
                {isHtml ? (
                  <div
                    className="about-html"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                ) : (
                  <p>{description}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        // empty state if description is not HTML (should not happen based on current data structure)
        <section id="about-event" className="event-about-section">
          <div className="event-section-card">
            <div className="event-section-header">
              <span className="event-section-indicator" />
              <h2 className="section-title">
                <span className="icon">
                  <RiInformationLine />
                </span>{' '}
                About the Event
              </h2>
            </div>
            <div className="event-about-content">
              <div className="about-text">
                <p>
                  No detailed description available for this event at the moment.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default EventAboutSection;
