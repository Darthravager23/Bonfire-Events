import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../Header.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleStopDelete() {
    setIsDeleting(false);
  }
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deletingError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });
  function handleDelete() {
    mutate({ id: id });
  }
  let content;
  if (isPending) {
    content = (
      <div style={{ textAlign: "center" }}>
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <ErrorBlock
        title='Failed to fetch detail'
        message={
          error.info?.message ||
          "Server is not responding. please try again later"
        }
      />
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-Us", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    content = (
      <>
        {isDeleting && (
          <Modal onClose={handleStopDelete}>
            <h1>Are you Sure?</h1>
            <p>Do you really want to delete this event? </p>
            <div className='form-actions'>
              {isPendingDeletion && <p>Deleting, please wait...</p>}
              {!isPendingDeletion && (
                <>
                  <button className='button-text' onClick={handleStopDelete}>
                    Close
                  </button>
                  <button className='button' onClick={handleDelete}>
                    Delete
                  </button>
                </>
              )}
            </div>
            {isErrorDeleting && (
              <ErrorBlock
                title='failed to delete event'
                message={
                  deletingError.info?.message || "Failed to delete event"
                }
              />
            )}
          </Modal>
        )}
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to='edit'>Edit</Link>
          </nav>
        </header>
        <div id='event-details-content'>
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id='event-details-info'>
            <div>
              <p id='event-details-location'>{data.location}</p>
              <time dateTime={`${data.date}${data.time}`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id='event-details-description'>{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  console.log(data);
  return (
    <>
      <Outlet />
      <Header>
        <Link to='/events' className='nav-item'>
          View all Events
        </Link>
      </Header>
      <article id='event-details'>{content}</article>
    </>
  );
}
