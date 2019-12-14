let Emotes = {
    init: function () {
        document.querySelectorAll('.message-list > li').forEach(el => {
            var nickname = el.querySelectorAll('.attribution.type abbr');
            if (nickname.lenght == 1) {
                console.log(nickname.innerText);
                this.getEmotes(el);
            }
            else {
                for (var elem of nickname) {
                    console.log(elem.innerText);
                }
                this.getEmotes(el);
            }
        });
    },
    
    getEmotes: function (el) {
        //console.log(el.innerText);
        var pid = el.dataset.nickname('li[id|="post"]').textContent;
        //var pid = el.querySelector('id');
        //console.log(pid);
        fetch("https://dota2.ru/forum/api/forum/getUsersWhoRatePost", {
        method: "POST",
        headers: { "x-requested-with": "XMLHttpRequest" },
        body: JSON.stringify({
            "pid": pid, // ID поста
            "smileId": 674 // ID эмоции
        })
        }).then(r => r.json()).then(console.log).catch(console.log);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    Emotes.init();
})
