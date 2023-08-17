// MObile 
if (window.innerWidth <= 600) {
    let elem = document.getElementById('content-container');
    elem.onclick = () => {
        elem.requestFullscreen()

    }
}
// import { URLSearchParams } from "url";
import { usersImg } from "./avatarapi.js";
import { io } from "./socket.io.esm.min.js";
const contactTemplate = document.getElementById('contact-template');
const contactContainer = document.getElementById('contacts-container');
const chatContainer = document.getElementById('chat-container');
const ChatTemplate = document.getElementById('chat-template');
let clear_chat = document.getElementById('clear-chat');
let chat_back_btn = document.getElementById('chat-back-btn');
const owner = document.getElementById('owner');
// let usersImg = document.getElementById('ownerPic').textContent;
document.getElementById('profile-img').innerHTML = usersImg;
document.getElementById('profile-Name').textContent = owner.textContent;


// const users = await fetch('/api/get-users');
// const users_cards = await users.json();
// Generate_Users(users_cards);

// SOCKET
const socket = io("/");
socket.on('connect', () => {
    console.log('You are connected with Giga Chat');
    
    socket.on('receive-message', async (From, message) => {
        if (From != document.getElementById('conversation-contact-Name').textContent.trim()) {
            Array.from(document.querySelectorAll('button.contact')).forEach(user => {
                if (user.querySelector('.contact-Name').textContent === From) {
                    let x = user.querySelector('.contact-new-messages');
                    let number = parseInt(x.textContent.trim());
                    if (isNaN(number)) {
                        number = 0;
                    }
                    let y = number + 1;
                    x.textContent = y;
                    x.classList.add('new-messages');
                }
            });
        } else {
            generate_message(message)
            let x = JSON.parse(localStorage.getItem(From));
            x.push(message);
            localStorage.setItem(UserName,JSON.stringify(x))
        }
    })
    socket.on('offline-Users', (id) => {
        console.log(id);
        Array.from(document.querySelectorAll('button.contact')).forEach(user => {
            if (user.querySelector('.contact-isOnline-id').textContent === id) {
                user.querySelector('.contact-isOnline').textContent = '';
                user.querySelector('.contact-isOnline-id').textContent = '';
            }
        });
    });
});
await socket.emit('get-users', owner.textContent.trim(), Generate_Users);
setInterval(() => {
    socket.emit('get-active-users', owner.textContent.trim());
}, 30000);
socket.on('Active-Users', (From, id) => {
    console.log(From, id);
    Array.from(document.querySelectorAll('button.contact')).forEach(user => {
        if (user.querySelector('.contact-Name').textContent === From) {
            user.querySelector('.contact-isOnline').textContent = 'Online';
            user.querySelector('.contact-isOnline-id').textContent = id;
        }
    });
});
// console.log('done');

// // Contact 
// const response = await fetch('/api/get-users');
// const Import_Users = await response.json();


// FUNCTIONS
function Generate_Users(Imported_Users) {
    Imported_Users.forEach(user => {
        const Card = contactTemplate.content.cloneNode(true).children[0];
        Card.querySelector('.contact-img').innerHTML = usersImg;
        Card.querySelector('.contact-Name').textContent = user.UserName;
        contactContainer.append(Card);
        Card.addEventListener('click', async (e) => {
            change_active_contact(e)
            e.target.classList.add('active-contact');
            e.target.classList.remove('inactive-contact');
            let UserName = e.target.querySelector('.contact-Name').textContent;
            await generate_chats(UserName);
            if (window.innerWidth <= 600) {
                // console.log('mobile');
                let Chat_Container = document.getElementById('conversation-container');
                let list_of_Contacts = document.getElementById('contacts-list')
                animation_in_mobiles(list_of_Contacts,Chat_Container);
                chat_back_btn.classList.remove('hide');
                chat_back_btn.addEventListener('click', () => {
                    animation_in_mobiles(Chat_Container,list_of_Contacts);
                    chat_back_btn.classList.add('hide');
                    document.getElementById('search-contacts').value = '';
                    Array.from(document.querySelectorAll('button.contact')).forEach(user => {
                        user.classList.remove('hide');
                    });
                })
            }
        })
    });
}

function animation_in_mobiles(removed,added) {
    removed.classList.add('animation-removed');
    removed.classList.remove('animation-added');
    added.classList.remove('animation-removed');
    added.classList.add('animation-added');
    setTimeout(() => {
        added.style.display= 'flex';
        removed.style.display= 'none';
    },500)
}
function change_active_contact(e) {
    Array.from(document.querySelectorAll('button.contact')).forEach(user => {
        user.classList.remove('active-contact');
        user.classList.add('inactive-contact');
    });
    let x = e.target.querySelector('.contact-new-messages');
    if (x.classList.contains('new-messages')) {
        x.classList.remove('new-messages');
        x.textContent = '';
    }
    if (document.getElementById('conversation-contact').classList.contains('hide')) {
        document.getElementById('conversation-contact').classList.remove('hide');
        document.getElementById('send-chat-container').classList.remove('hide');
    }
    document.getElementById('conversation-contact-img').innerHTML = e.target.querySelector('.contact-img').innerHTML;
    document.getElementById('conversation-contact-Name').textContent = e.target.querySelector('.contact-Name').textContent;
};
async function delete_prev_chats() {
    let chat = Array.from(document.getElementById('chat-container').querySelectorAll('.chat-card'));
    if (chat) {
        chat.forEach(data => {
            data.remove();
        })
    }
};
async function generate_chats(userName) {
    await delete_prev_chats();
    function generate_chats_foreach(Chat_Imported) {
            console.log(Chat_Imported);
            Chat_Imported.map(generate_message);
    }
    socket.emit('get-messages', userName.trim(), owner.textContent.trim(), generate_chats_foreach);
};
function generate_message(user) {
    const Card = ChatTemplate.content.cloneNode(true).children[0];
    let secret = document.createElement("p");
    secret.textContent = user._id;
    secret.classList.add('hide');
    secret.classList.add('chat-id');
    let message = Card.querySelector('.chat-message')
    message.textContent = user.message;
    if (user.Sender == owner.textContent) {
        message.classList.add('chat-sender-owner');
    } else {
        message.classList.add('chat-sender-other');
    }
    chatContainer.appendChild(Card);
    Card.appendChild(secret);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    select_messages();
}
function select_messages() {
    let chat_cards = Array.from(document.querySelectorAll('.chat-card'));
    function select_messages_eventlistenr(user) {
        user.classList.add('selected-chat');
        chat_back_btn.classList.remove('hide');
        document.getElementById('chat-back-btn-text').textContent = 'Delete_Chat_Messages';
        Array.from(document.querySelectorAll('.chat-card')).forEach(el => {
            el.addEventListener('click', () => {
                if (document.getElementById('chat-back-btn-text').textContent.includes('Delete_Chat_Messages')) {
                    el.classList.toggle('selected-chat');
                }
            });

        });
    }
    chat_cards.forEach(user => {
        user.addEventListener('dblclick', function () {
            select_messages_eventlistenr(user);
        })
    });
}
async function send_chats(message) {
    let from = owner.textContent.trim();
    let to = document.getElementById('conversation-contact-Name').textContent.trim();
    socket.emit('send-message', from, to, message, generate_message);
};

async function clear_chats() {
    Array.from(document.querySelectorAll('.chat-card')).forEach(user => {
        user.remove();
    })
};
async function clear_messages() {
    let chat_cards = Array.from(document.querySelectorAll('.selected-chat'));
    chat_cards.forEach((user) => {
        user.remove();
    })

};


// EVENT LISTENERS
document.getElementById('search-contacts').addEventListener('input', (e) => {
    let search = e.target.value.toLowerCase();
    let contacts = Array.from(document.querySelectorAll('.contact'));
    contacts.forEach(user => {
        let IsVisible = user.querySelector('.contact-Name').textContent.toLowerCase().includes(search.trim())
        user.classList.toggle('hide', !IsVisible);
    })
})
document.getElementById('send-chats').addEventListener('keypress', async (e) => {
    if (e.target.value != ''&& e.key === 'Enter') {
        await send_chats(e.target.value);
        e.target.value = '';
        // let userName = document.getElementById('conversation-contact-Name').textContent;
        // generate_chats(userName);
    }
});
document.getElementById('send-chat-btn').addEventListener('click', async () => {
    let message = document.getElementById('send-chats').value;
    if (message != '') {
        await send_chats(message);
        document.getElementById('send-chats').value = '';
    }
});
clear_chat.addEventListener('click', async () => {
    let chat_cards = Array.from(document.querySelectorAll('.selected-chat'));
    if (chat_cards.length != 0) {
        let chatlist = chat_cards.map((user) => {
            let chat = user.querySelector('.chat-id').textContent.trim();
            return [chat];
        });
        socket.emit('clear-messages', chatlist, clear_messages);
        chat_back_btn.classList.add('hide');
        document.getElementById('chat-back-btn-text').textContent = '';
    } else {
        let userName = document.getElementById('conversation-contact-Name').textContent;
        socket.emit('clear-chat', owner.textContent.trim(), userName.trim(), clear_chats);
    }
});

chat_back_btn.addEventListener('click', () => {
    chat_back_btn.classList.add('hide');
    document.getElementById('chat-back-btn-text').textContent = '';
    Array.from(document.querySelectorAll('.chat-card')).forEach(el => {
        el.classList.remove('selected-chat');
    })
})

