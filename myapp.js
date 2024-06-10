InboxSDK.load(2, "YOUR_APP_ID_HERE").then(function (sdk) {
  function showModal(messageContent) {
    sdk.Widgets.showModalView({
      el: createModalContent(messageContent), // The content of the modal
      title: "Phishing Report",
      buttons: [
        {
          text: "Close",
          onClick: function () {
            modal.close();
          },
        },
        {
          text: "Report",
          onClick: function () {
            alert("Message Reported");
            modal.close();
          },
        },
      ],
      showCloseButton: true,
    });
  }

  function createModalContent(messageContent) {
    const content = document.createElement("div");
    content.innerHTML = `
            <div style="padding: 20px;">
                <h2 id="loadingText">Loading...</h2>
                <p id="responseText"></p>
            </div>
        `;
    checkForPhishing(messageContent)
      .then((responseText) => {
        document.getElementById("loadingText").innerText = "";
        document.getElementById("responseText").innerText = responseText;
      })
      .catch((error) => {
        console.log(error);
        document.getElementById("responseText").innerText =
          "Error: " + error.message;
      });
    return content;
  }

  async function checkForPhishing(emailMessage) {
    const apiKey = "YOUR_OPEN_AI_KEY";
    const apiEndpoint = "https://api.openai.com/v1/chat/completions"; // Use the appropriate endpoint for your API key and model

    const data = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant is helpful, creative, clever, and very friendly.",
        },
        {
          role: "user",
          content: `Do a Report and describe the probability of this message being phishing or a scam: ${emailMessage}`,
        },
      ],
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  }

  sdk.Conversations.registerThreadViewHandler(function (threadView) {
    console.log("Thread opened:", threadView);

    threadView.getMessageViews().forEach(function (messageView) {
      const messageContent = messageView.getBodyElement().innerText;
      showModal(messageContent);
    });
  });
});
