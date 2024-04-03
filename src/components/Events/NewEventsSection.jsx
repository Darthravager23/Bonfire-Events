import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";

export default function NewEventsSection() {
  const { data, isPending, error, isError } = useQuery({
    queryKey: ["events", { max: 3 }],
    queryFn: ({ signal }) => fetchEvents({ signal, max: 3 }),
    staleTime: 5000, // after how many milliswcods new req is send to fetch data again
    //gcTime: 30000, // for long the cache data is stored
  });
  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title='An error occurred'
        message={error.info?.message || "failed to fetch events"}
      />
    );
  }

  if (data) {
    content = (
      <ul className='events-list'>
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className='content-section' id='new-events-section'>
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
