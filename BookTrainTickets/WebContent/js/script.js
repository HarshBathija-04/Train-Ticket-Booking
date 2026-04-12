// Client-side validation script
document.addEventListener("DOMContentLoaded", function () {
  // Booking Form validation
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      const seats = document.getElementById("seats").value;
      const availableSeats = document.getElementById("availableSeats").value;

      if (parseInt(seats) <= 0) {
        e.preventDefault();
        alert("Please select at least 1 seat to book.");
      } else if (parseInt(seats) > parseInt(availableSeats)) {
        e.preventDefault();
        alert("Not enough seats available! Only " + availableSeats + " left.");
      }
    });
  }

  // Cancel Ticket Confirmation
  const cancelForms = document.querySelectorAll(".cancelForm");
  cancelForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (
        !confirm(
          "Are you sure you want to cancel this ticket? This action cannot be undone.",
        )
      ) {
        e.preventDefault();
      }
    });
  });

  // Date validation for search
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }
});
