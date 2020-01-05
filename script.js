const Asmund = {
	/* Highlight - подсветка сообщений раздела модератора */
	/*														*/
	/********************************************************/
	highlight: {
		 /*** Список категорий для групп пользователей ***/
		modGroupList: {
			"Модератор других игр, CS:GO и разного": ["Другие игры", "Counter-Strike: Global Offensive", "Разное"],
			"Модератор технического раздела": ["Технический раздел"],
			"Модератор основного раздела": ["Основной раздел"]
		},

		 /*** Список форумов в категориях ***/
		categories: {
			"Основной раздел": ["Общие вопросы и обсуждения", "Обитель нытья", "Dota Plus, компендиумы и ивенты", "Обновления и патчи", "Рейтинговая система и статистика", "Герои: общие обсуждения", "Dream Dota", "Нестандартные сборки", "Киберспорт: общие обсуждения", "Игроки и команды", "Турниры, матчи и прогнозы", "Поиск игроков для ммр и паб игр", "Поиск игроков для создания команды", "Поиск команды для совместных игр и участия в турнирах", "Поиск игроков для ивентов и абузов", "Обмен предметами и гифтами", "Обсуждения и цены", "Медиа Dota 2", "Стримы","Развитие портала"],
			"Counter-Strike: Global Offensive": ["[CS:GO] Общие вопросы и обсуждения", "[CS:GO] Обновления и патчи", "[CS:GO] Киберспорт", "[CS:GO] Обменник"],
			"Технический раздел": ["Техническая поддержка по Dota 2", "Железо и обсуждения", "Сборка ПК, значительный апгрейд", "Выбор комплектующих, ноутбуков, консолей", "Компьютерная помощь по остальным вопросам", "Игровые девайсы, периферия и прочая техника", "Мобильные девайсы", "Софт и прочие технические вопросы", "Steam", "Программирование"],
			"Другие игры": ["Другие игры", "The Elder Scrolls", "Path of Exile", "Shooter, Battle Royale", "Apex Legends", "ККИ", "Hearthstone", "Artifact", "League of Legends", "MMO (RPG, FPS, RTS)", "World of Warcraft", "Dota Underlords", "Dota Auto Chess", "Консольные игры", "Мобильные игры"],
			"Разное": ["Таверна", "Творчество", "Музыка", "Кино и сериалы", "Аниме и прочее", "Спорт", "Книги"]
		},
		
		 /*** Получение группы пользователя ***/
		loadGroupName: async () => {
			return await fetch(`/forum/members/${Utils.user_id}/`).then(a => a.text()).then(r => { // Допишешь 200/40*/50*
				let div = document.createElement('div');
				div.innerHTML = r;

				return div.querySelector('.group').innerHTML.trim();
			});
		},

		 /*** Получить форумы для группы пользователя ***/
		getForums: function () {
			 // Получаем группу и перебираем категории
			return this.loadGroupName().then(group => {
				let list = this.modGroupList[group], result = [];
				
				if (list === undefined) {
					console.log(`Пользователь ${Utils.username} не состоит ни в одной из групп модераторов разделов.\nЕго группа: ${group}.`);
					return [];
				}

				for (cat in this.categories) {
					if (list.indexOf(cat) !== ~false) {
						result = result.concat(this.categories[cat]);
					}
				}
				
				return result;
			});
		},
		
		 /*** Инициализация highlight ***/
		init: function () {
			this.getForums().then(response => {
				document.querySelectorAll('.search-results-list li').forEach(el => {
					let fold = el.querySelector('.meta a[href*="forums/"]').innerHTML;
					console.log(fold);
					if (response.indexOf(fold) === ~false) {
						el.style.setProperty('opacity', '0.4');
					}
				});
			})
		}
	},




	/* Emotions - определение оценки автора цитируемого поста */
	/*														  */
	/**********************************************************/
	emotions: {
		 /*** Получаем все посты, в которых есть цитаты и эмоции под постом ***/
		getInf: () => {
			 // Получаем все посты
			return [...document.querySelectorAll('.message-list > li')].map(el => {
				return {
					 // Запоминаем DOM и ID поста
					postInf: {
						post: el,
						pid: el.dataset.id
					},
					 // Получаем все цитаты в посте (ник и id цитируемых)
					quoteInf: [...el.querySelectorAll('.bbCodeQuote')].map(a => {
						return {
							name: a.dataset.author,
							uid: a.dataset.userId
						}
					}),
					 // Получаем все лайки под постом (количество, id и названия смайлов)
					smiles: [...el.querySelectorAll('.post-smiles-content a:not(.rate-btn-plus)')].map(b => {
						return {
							count: b.dataset.smileCount,
							sid: b.dataset.smileId,
							title: b.querySelector('img').getAttribute('title'),
							image: b.querySelector('img').getAttribute('src')
						}
					}).filter(c => c.count > 0) // Избавляемся от "пустых" смайлов
				}
			}).filter(d => d.quoteInf.length > 0 && d.smiles.length > 0); // И фильтруем от "пустых" ячеек
		},
		
		 /*** Получаем список пользователей, оценивших пост ***/
		getUsers: (pid, sid) => {
			return fetch("/forum/api/forum/getUsersWhoRatePost", {
				method: "POST",
				headers: { "x-requested-with": "XMLHttpRequest" },
				body: JSON.stringify({
					"pid": pid, // ID поста
					"smileId": sid // ID эмоции
				})
			}).then(r => r.json()); // Тут допишешь проверку на 200/40*/50*, вынести в отдельную ф-ию
		},
		
		/*** Получить всё о пользователях, что оценили свои цитаты ***/
		getQuoteRatedUsers: async function () {
			let info = this.getInf(), result = [];
			
			 // Поэтапно отправляем полученные запросы
			for (item of info) {
				for (smile of item.smiles) {
					let p = item.postInf, s = smile, q = item.quoteInf;
					
					 // Работаем с promise
					let res = await this.getUsers(p.pid, s.sid).then(response => {
						 // Из ответа нам нужны только ID, собираем их
						let uids = response.map(a => a['user.id']);
						
						for (nick of q) {
							 // Нашлось ID цитируемого - запоминаем
							if (uids.indexOf(nick.uid) !== ~false) {
								result.push({
									post: {
										dom: p.post, // DOM поста
										id: p.pid // ID поста
									},
									user: {
										name: nick.name, // Имя пользователя
										id: nick.uid // ID пользователя
									},
									smile: {
										title: s.title, // Имя смайла-оценки
										id: s.sid, // ID смайла-оценки
										image: s.image //Картинка смайла
									}
								});
							}
						}
					});
				}
			}
			
			return result;
		},
		
		 /*** Отрисовка результата ***/
		render: (post, name, smile) => {
			let rated = post.querySelector('div[id|="post-rated-list"]');
			
			if (!rated.querySelector(`[data-name="${name}"]`)) {
				let title = document.createElement('p');
				title.style = "padding: 2px 6px; background: #363636; color: #dedede; border-radius: 3px; margin-top: 6px;";
				title.setAttribute('data-name', name);
				title.innerHTML = `<b>${name}</b> отреагировал на цитирование - <img src="${smile}">`;
				
				rated.append(title);
			}
		},
		
		 /*** Инициализация emotions ***/
		init: async function () {
			let result = [],
				list = await this.getQuoteRatedUsers().then(e => {
					result = e; // Для твоего удобства вывел из promise в синхрон
				});
			
			//console.log(result);
			
			for (i of result)
				this.render (i.post.dom, i.user.name, i.smile.image);
		}
	},


	emotions_ts: {
		getInf: () => {
			return [...document.querySelectorAll('.message-list > li')].map(el => {
				return {
					postInf: {
						post: el,
						pid: el.dataset.id
					},
					quoteInf: [...el.querySelectorAll('.bbCodeQuote')].map(a => {
						return {
							name: a.dataset.author,
							uid: a.dataset.userId
						}
					}),
					smiles: [...el.querySelectorAll('.post-smiles-content a:not(.rate-btn-plus)')].map(b => {
						return {
							count: b.dataset.smileCount,
							sid: b.dataset.smileId,
							title: b.querySelector('img').getAttribute('title'),
							image: b.querySelector('img').getAttribute('src')
						}
					}).filter(c => c.count > 0)
				}
			}).filter(d => d.quoteInf.length == 0 && d.smiles.length > 0);
		},

		getUsers: (pid, sid) => {
			return fetch("/forum/api/forum/getUsersWhoRatePost", {
				method: "POST",
				headers: { "x-requested-with": "XMLHttpRequest" },
				body: JSON.stringify({
					"pid": pid, // ID поста
					"smileId": sid // ID эмоции
				})
			}).then(r => r.json());
		}, 

		getQuoteRatedUsers: async function () {
			let info = this.getInf(), result = [];
			
			 // Поэтапно отправляем полученные запросы
			for (item of info) {
				for (smile of item.smiles) {
					let p = item.postInf, s = smile, q = item.quoteInf;
					
					 // Работаем с promise
					let res = await this.getUsers(p.pid, s.sid).then(response => {
						 // Из ответа нам нужны только ID, собираем их
						let uids = response.map(a => a['user.id']);
						
						for (nick of q) {
							 // Нашлось ID цитируемого - запоминаем
							if (uids.indexOf(nick.uid) !== ~false) {
								result.push({
									post: {
										dom: p.post, // DOM поста
										id: p.pid // ID поста
									},
									user: {
										name: nick.name, // Имя пользователя
										id: nick.uid // ID пользователя
									},
									smile: {
										title: s.title, // Имя смайла-оценки
										id: s.sid, // ID смайла-оценки
										image: s.image //Картинка смайла
									}
								});
							}
						}
					});
				}
			}
			
			return result;
		},

		render: (post, name, smile) => {
			let rated = post.querySelector('div[id|="post-rated-list"]');
			
			if (!rated.querySelector(`[data-name="${name}"]`)) {
				let title = document.createElement('p');
				title.style = "padding: 2px 6px; background: #363636; color: #dedede; border-radius: 3px; margin-top: 6px;";
				title.setAttribute('data-name', name);
				title.innerHTML = `Автор темы - <b>${name}</b> отреагировал на цитирование - <img src="${smile}">`;
				
				rated.append(title);
			}
		},
		
		 /*** Инициализация emotions ***/
		init: async function () {
			let result = [],
				list = await this.getQuoteRatedUsers().then(e => {
					result = e; // Для твоего удобства вывел из promise в синхрон
				});
			
			//console.log(result);
			
			for (i of result)
				this.render (i.post.dom, i.user.name, i.smile.image);
		}
	},



	/* Подсветка цитат удалённых сообщений */
	/*										*/
	/************************************** */
	removeHelper: {
		getMessages: () => {
			return [...document.querySelectorAll('#message-list > li')]
		},
		
		getRemovedIDs: (messages) => {
			return messages.filter(a => a.classList.contains('deleted')).map(a => a.dataset.id)
		},
		
		getQuotedIDs: function () {
			let messages = this.getMessages(),
				removedMessages = this.getRemovedIDs(messages),
				result = [];
		
			for (message of messages) {
				let quote = message.querySelector(`div.bbCodeQuote[data-post-id]`);
				
				if (quote !== null) {
					let id = quote.dataset.postId;
			
					if (removedMessages.indexOf(id) !== ~false) {
					/*result.push({
						id: message.dataset.id,
						post: message
					});*/
					result.push(message.dataset.id);
					}
				}
			}

			return result;
		},
		
		init: function () {
			let posts = this.getQuotedIDs();
			for (el of posts) {
				let elem = document.getElementById(`post-${el}`);
				elem.classList.add('asmund-find');
			}
		}
	},




	/* Избранные смайлы под постом */
	/*								*/
	/********************************/
	favoritesEmotions: {
        getPinned: () => {
            let pinned = localStorage.getItem('asmund-pinned-emotions');
            return pinned !== null ? JSON.parse(pinned) : [{
                id: 1033, 
				src: "/img/forum/emoticons/FeelsClownMan.png?1552738440",
			},
			{
				id: 370, 
				src: "/img/forum/emoticons/navi.png?1566518543",
			},
			{
				id: 1053, 
				src: "/img/forum/emoticons/PepeYes.png?1556510258",
			},
			{
				id: 1054, 
				src: "/img/forum/emoticons/PepeNo.png?1556510271",
			},
			{
				id: 1028, 
				src: "/img/forum/emoticons/PuckHmmm.png?1551227370",
			}]
        },
        
        render: (dom, smile) => {
            let a = document.createElement('a');
			
            a.setAttribute('data-asmund-sid', smile.id);
			a.setAttribute('onclick', `javascript: Topic.setPostRate(${dom.id}, ${smile.id}); return false;`);
            a.innerHTML = `<img class="asmund-preview-smiles" src="${smile.src}">`;
            
            dom.post.append(a);
		},

		/*addsmiles: () => {

		},*/

        init: function () {
            let holderList = document.querySelectorAll('.message-list > li'),
                smiles = this.getPinned();
            
            for (holder of holderList) {
                for (smile of smiles) {
                    this.render({
                            post: holder.querySelector('.postDataHolder'), 
                            id: holder.dataset.id
                        }, 
                        smile
					);
                }
			}
        }
    },



	/***  Поиск матерных слов в постах ***/
	searchBadWords: {
		getPosts: () => {
			return [...document.querySelectorAll('.message-list .messageContent .messageText.baseHtml p')];
		},

		init: function () {
			var posts = this.getPosts();
			var words = ["del", "/дел", "хер", "сука", "суки", "сукам", "пиздец", "хуй", "еба", "нахуй", "*", "блять", "блядь"];
			for (el of posts) {
				for (elem of words) {
					if (el.innerHTML.toLowerCase().indexOf(elem) != -1) {
						el.style = "background: #f1c40f; color: #000000"; //желтый: #f1c40f зелёный: #78cc66
					}
				}
			}
		}
	},



	/***  Поиск матерных слов в постах ***/
	/*searchBadWords: {
		// Список trigger слов
        trigger: ['del', 'дел', 'хер', 'хуй', 'пизд', 'нах', 'уеб', 'сук'],
       
         // Применяемые стили на найденные слова
        styles: [
            //'border: 1px dashed green',
            //'color: #fff',
            //'padding: 1px 4px',
			//'margin: -2px -5px'

			'background: #f1c40f',
			'color: #000000'
        ],
       
         // Получение родительского this
        This: function () {
            return this
        },
       
         // Рендер скроллинфы
        renderInfo: {
            divider: 1000,
            windowHeight: 0,
            fullHeight: 0,
            canvas: undefined,
 
             // Список элементов
            list: [],
           
            render: function (list, site, wind) {
                let ct = this.canvas.getContext('2d');
               
                console.log(list);
               
                for (item of list) {
                    let y = item.getClientRects()[0].top,
                        eltop = (y / site) * wind; // element top
                       
                    console.log(y, eltop);
                       
                    ct.beginPath();
                    ct.moveTo(20, eltop);
                    ct.lineTo(5, eltop);
                    ct.lineTo(8, eltop - 2);
                    ct.lineTo(8, eltop + 2);
                    ct.lineTo(5, eltop);
                    ct.closePath();
                   
                    ct.strokeStyle = 'red';
                    ct.stroke();
                }
               
                document.body.append(this.canvas);
            },
           
            init: function () {
                this.windowHeight = window.innerHeight;
                this.fullHeight = document.querySelector('body').offsetHeight;
               
                this.canvas = document.createElement('canvas');
                this.canvas.style = 'position: fixed; right: 0; top: 0; width: 20px; height: 100%';
                this.canvas.setAttribute('width', '20px');
                this.canvas.setAttribute('height', `${this.windowHeight}px`);
               
                let list = this.list,
                    sp = this.fullHeight / this.divider, // site percent
                    wp = this.windowHeight / this.divider; // window percent
                   
                console.log(list);
                   
                this.render(list, sp, wp);
            }
        },
       
         // Генератор regexp на основе trigger слов
        regexp: function () {
            return new RegExp(`[\/]?(${this.trigger.join('|')})`, 'ig')
        },
       
         // Получение всех строк
        getStrs: () => {
            return [...document.querySelectorAll('#message-list p')];
        },
         
         // Инициализация модуля
        init: function () {
            let strs = this.getStrs(),
                rexp = this.regexp(),
                styles = this.styles.join('; ');
           
            for (str of strs) {
                if (rexp.test(str.innerHTML)) {
                    str.innerHTML = str.innerHTML.replace(rexp, `<span style="${styles}">\$1</span>`);
                    this.renderInfo.list.push(str);
                }
            }
           
             // Инициализация рендера
            this.renderInfo.init();
        }
    },*/



     /*** Общая инициализация компонентов ***/
    init: function () {
        this.highlight.init();
		this.emotions.init();
		this.emotions_ts.init();
		this.removeHelper.init();
		this.favoritesEmotions.init();
		this.searchBadWords.init();
    }
}

window.addEventListener('DOMContentLoaded', function() {
    Asmund.init();
})
