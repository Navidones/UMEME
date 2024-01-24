document.addEventListener("DOMContentLoaded", function () {
    var myForm = document.getElementById("myForm");

    myForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevents the default form submission

        // Collect form data
        var formData = new FormData(myForm);
        var jsonData = {};

        // Convert FormData to JSON
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        // Submit the form data to the server using Fetch API
        fetch("/submit-form", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => {
            if (!response.ok) {
                // Server returned an error response
                throw new Error(`Server error: ${response.statusText}`);
            }
            return response.json(); // Assuming the server returns a JSON response
        })
        .then(data => {
            // Handle the success response
            alert(data.message); // Use the received message as the alert content
            // Optionally, reset the form
            myForm.reset();
        })
        .catch(error => {
            // Handle the error
            console.error(error); // Log the detailed error to the console
            alert("Form submission failed. Please try again."); // You can replace this with a custom pop-up/modal
        });
    });
});
