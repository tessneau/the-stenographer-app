// ------------------ VARIABLES -----------------------------
const main = document.querySelector("#main");
const sidebar = document.querySelector("#sidebar");
const usernameContainer = document.querySelector("#username-container");
const topicsList = document.querySelector("#topics-list");
const notesContainer = document.querySelector("#notes-container");
let currentTopic;

// modal variables
const newTopicAnchor = document.querySelector('#new-topic')
const modal = document.querySelector('#modal')
const closeBtn = document.querySelector(".close-btn")
const modalForm = document.querySelector("#modal-form")

//login variables
let currentUser = ""
const loginForm = document.querySelector("#login-form")


if (currentUser === "") {

// --- login events ---
loginForm.addEventListener('submit', getOrPostUser)

// --- login fetch ---
function getOrPostUser(e) {
  e.preventDefault()
  const nameInput = document.querySelector("#user-name").value

  fetch(`http://localhost:3000/users/${nameInput}`, {
    method: 'POST',
    headers: {'Content-Type' : 'application/json'}
  })
  .then(res => res.json())
  .then(user => {
      currentUser = user
      loginForm.style.display = "none"
      loggedIn()
    })
  }
}


function loggedIn() {
// if (currentUser !== "") {


// ------------------- FETCHES -------------------------------
  // fetch('http://localhost:3000/users')
  // .then(resp => resp.json())
  // .then(users => {
  //   usernameContainer.innerText = users[Math.floor(Math.random() * users.length)].name;
  // });
  usernameContainer.innerText = currentUser.name


  // function getOneUser(userId){
  //   fetch(`http://localhost:3000/users/${userId}`)
  //   .then(res => res.json())
  //   .then(console.log)
  // }
  fetchMyTopics()

  function fetchMyTopics() {
    fetch('http://localhost:3000/topics')
    .then(res => res.json())
    .then(data => {
      const currUserTopics = data.filter(topic => topic.user.id === currentUser.id)
      addTopicsToSidebar(currUserTopics)
    })
  }

  function fetchAllTopics() {
    fetch(`http://localhost:3000/topics`)
    .then(res => res.json())
    .then(addTopicsToSidebar)
  }

  function postTopic(e) {
    e.preventDefault()
    const titleInput = document.querySelector("#topic-title").value
    const tagsInput = document.querySelector("#topic-tags").value

    fetch('http://localhost:3000/topics', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        title: titleInput,
        tags: tagsInput,
        user_id: currentUser.id
      })
    })
    .then(res => res.json())
    .then(topics => {
      oneTopicToSideBar(topics)
      modalForm.reset()
      modal.style.display = "none"
    })

  }

  // ------------------ EVENT LISTENERS -------------------------
  sidebar.addEventListener('mouseover', e => {
    e.target.style.width = "250px";
    main.style.marginLeft = "250px";
  });

  sidebar.addEventListener('mouseleave', e => {
    e.target.style.width = "0.5%";
    main.style.marginLeft = "0";
  });

  sidebar.addEventListener('click', addNotesToDOM);

  notesContainer.addEventListener('click', noteClickHandler);

  // -- modal events
  newTopicAnchor.addEventListener('click', e => {
    modal.style.display = "block"
  })

  closeBtn.addEventListener('click', e => {
    modal.style.display = "none"
  })

  window.addEventListener('click', e => {
    if (e.target == modal){
      modal.style.display = "none"
    }
  })

  // -- modal form events
  modalForm.addEventListener('submit', postTopic)

  // ----------------------- FUNCTIONS -----------------------------
  function addTopicsToSidebar(topics) {
    const twentyTopics = topics.slice(0,20)
    topicsList.innerHTML = '';
    twentyTopics.forEach(topic => {
      oneTopicToSideBar(topic)
    });
  }

  function oneTopicToSideBar(topic) {
    const tagsToString = 'Tags: ' + topic.tags.join(', ')
    topicsList.innerHTML += `
    <li id="topic-${topic.id}" class="topic-item sidebar-text" title="${tagsToString}">${topic.title}</li>
    `
  }

  function switchSidebarTopics(e) {
    if(e.target.id === "switch-topics"){
      const switchTopicsAnchor = document.querySelector("#switch-topics")
      if (switchTopicsAnchor.innerText === "See All Topics") {
        fetchAllTopics()
        switchTopicsAnchor.innerText = "See My Topics"
      } else {
        fetchMyTopics()
        switchTopicsAnchor.innerText = "See All Topics"
      }
    }
  }

  function addNotesToDOM(e) {
    currentTopic = +e.target.id.split('-')[1];
    document.querySelector('h1').innerText = e.target.innerText;
    // console.log(e.target.innerText);
    if(e.target.className.includes('topic-item')) {
      notesContainer.innerHTML = `
        <a class="add-note add-child-note" style="font-size: 25px;" title="Add a child note">+</a>
      `;
      fetch(`http://localhost:3000/notes`).then(resp => resp.json()).then(notes => {
        const filteredNotes = notes.filter(note => note.topic_id == +e.target.id.split('-')[1]);
        console.log(filteredNotes);
        filteredNotes.sort((a,b) => a.id - b.id).forEach(note => {
          if(!note.ancestry) {
            addNoteToDOM(notesContainer, note)
          } else {
            const parentContainer = document.querySelector(`li[id="${note.ancestry.includes('/') ? +note.ancestry.split('/')[note.ancestry.split('/').length - 1] : +note.ancestry}"]`);
            addNoteToDOM(parentContainer, note);
          }
        })
<<<<<<< HEAD
      });
    }
  }

  function noteClickHandler(e) {
    if(e.target.className.includes('add-note') && !e.target.className.includes('add-child-note')) console.log('add parent note');
    if(e.target.className.includes('add-child-note')) {
      const targetLi = e.target.parentNode;
      addNoteFormToDOM(targetLi);
      const curForm = targetLi.querySelector('form');
      curForm.addEventListener('submit', e => {
        e.preventDefault();
        // console.log(e.target.querySelector("#new-note-text").value)
        fetch('http://localhost:3000/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: e.target.querySelector("#new-note-text").value,
            topic_id: currentTopic,
            ancestry: e.target.parentNode.tagName === 'LI' ? (e.target.parentNode.ancestry ? e.target.parentNode.ancestry + '/' + e.target.parentNode.id : e.target.parentNode.id.toString()) : null
          })
        }).then(resp => resp.json()).then(data => {
          console.log(data.id);
          addNoteToDOM(e.target.parentNode, data)
          e.target.parentNode.removeChild(curForm);
        })
        curForm.reset();
      });
    }
    if(e.target.className.includes('remove-note')) {
      fetch(`http://localhost:3000/notes/${e.target.parentNode.id}`, {
        method: 'delete'
=======
      }).then(resp => resp.json()).then(data => {
        addNoteToDOM(e.target.parentNode, data)
        console.log(e.target.parentNode);
        !!e.target.parentNode ? e.target.parentNode.removeChild(curForm) : document.querySelector('#new-top-level-note').removeChild(curForm);
>>>>>>> master
      })
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    }
  }
<<<<<<< HEAD

  function addNoteToDOM(container, note) {
    const newNoteHTML = `
      <li id=${note.id} title="Created by: someuser" ancestry=${note.ancestry}>${note.content}&nbsp;&nbsp;&nbsp;&nbsp;<a class="add-note add-child-note" style="font-size: 25px;" title="Add a child note">+</a>&nbsp;&nbsp;&nbsp;&nbsp;<a class="remove-note" style="font-size: 25px;" title="Delete this note and all children">-</a></li>
      `
    if(container.tagName === 'LI') {
      const nestedUl = document.createElement('ul');
      nestedUl.innerHTML = newNoteHTML;
      container.append(nestedUl);
    } else {
      container.innerHTML += newNoteHTML;
    }
=======
  if(e.target.className.includes('remove-note')) {
    const noteId = e.target.parentNode.id;
    fetch(`http://localhost:3000/notes/${noteId}`, {
      method: 'delete'
    })
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
>>>>>>> master
  }

  function addNoteFormToDOM(noteLi) {
    noteLi.innerHTML += `
      <form>
        <input id="new-note-text" type="text">
        <input type="submit" name="submit">
      </form>
    `
  }

}
