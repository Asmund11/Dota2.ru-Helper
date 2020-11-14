const Asmund = {
	/* Highlight - подсветка сообщений раздела модератора */
	/*														*/
	/********************************************************/
	highlight: {
		 /*** Список категорий для групп пользователей ***/
		modGroupList: {
			"Модератор основного раздела": ["Основной раздел"],
			"Модератор технического раздела": ["Технический раздел"],
			"Модератор других игр и разного": ["Другие игры", "Разное"]
		},

		 /*** Список форумов в категориях ***/
		categories: {
			"Основной раздел": ["Общие вопросы и обсуждения", "Обитель нытья", "Dota Plus, компендиумы и ивенты", "Обновления и патчи", "Рейтинговая система и статистика",
				"Герои: общие обсуждения", "Dream Dota", "Нестандартные сборки", "Киберспорт: общие обсуждения", "Игроки и команды", "Турниры, матчи и прогнозы",
				"Поиск игроков для ммр и паб игр", "Поиск игроков для создания команды", "Поиск команды для совместных игр и участия в турнирах",
				"Поиск игроков для ивентов и абузов", "Обмен предметами и гифтами", "Обсуждения и цены", "Медиа Dota 2", "Стримы", "Custom Hero Chuos", "Развитие портала"],
			"Counter-Strike: Global Offensive": ["[CS:GO] Общие вопросы и обсуждения", "[CS:GO] Киберспорт"],
			"Технический раздел": ["Техническая поддержка по Dota 2", "Железо и обсуждения", "Сборка ПК, значительный апгрейд", "Выбор комплектующих, ноутбуков, консолей",
				"Компьютерная помощь по остальным вопросам", "Игровые девайсы, периферия и прочая техника", "Мобильные девайсы", "Софт и прочие технические вопросы", "Steam",
				"Программирование"],
			"Другие игры": ["Другие игры", "The Elder Scrolls", "Path of Exile", "Shooter, Battle Royale", "Apex Legends", "ККИ", "Hearthstone", "Artifact",
			"League of Legends", "MMO (RPG, FPS, RTS)", "World of Warcraft", "Dota Underlords", "Dota Auto Chess", "Консольные игры", "Мобильные игры"],
			"Разное": ["Таверна", "Творчество", "Музыка", "Кино и сериалы", "Аниме и прочее", "Спорт", "Книги"]
		},
		
		 /*** Получение группы пользователя ***/
		loadGroupName: async () => {
			return Utils.groupName;
		},

		 /*** Получить форумы для группы пользователя ***/
		getForums: function () {
			 // Получаем группу и перебираем категории
			return this.loadGroupName().then(group => {
				let list = this.modGroupList[group], result = [];
				
				if (list === undefined) {
					console.log(`Пользователь ${Utils.username} не состоит ни в одной из групп модераторов разделов.\nЕго группа: ${group}.`);
					return;
				}

				for (let cat in this.categories) {
					if (list.indexOf(cat) !== ~false) {
						result = result.concat(this.categories[cat]);
						console.log(result);
					}
				}
				
				return result;
			});
		},
		
		 /*** Инициализация highlight ***/
		init: function () {
			this.getForums().then(response => {
				if (response == null)
					return;
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
	quote_emotions: {
		// Все посты с цитатами и смайлами
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
					}).filter(c => c.count > 0),
					mentions: [...el.querySelectorAll('.mceNonEditable.mention')].map(c => {
						return {
							name: c.innerText.replace('@', ''),
							uid: c.dataset.userId
						}
					}),
				}
			}).filter(d => d.quoteInf.length > 0 && d.smiles.length > 0);
		},

		// Все посты без цитат со смайлами
		getInfEmptyPosts: () => {
			return [...document.querySelectorAll('.message-list > li')].map(el => {
					return {
						postInf: {
							post: el,
							pid: el.dataset.id
						},
						quoteInf: [...el.querySelectorAll('.bbCodeQuote:not(.signature)')].map(a => {
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
						}).filter(c => c.count > 0),
						mentions: [...el.querySelectorAll('.mceNonEditable.mention')].map(c => {
							return {
								name: c.innerText.replace('@', ''),
								uid: c.dataset.userId
							}
						}),
					}
			}).filter(d => d.quoteInf.length == 0 && d.smiles.length > 0);
	   },

		getUsers: (pid, sid) => {
			return fetch("/forum/api/forum/showPostRates", {
				method: "POST",
				headers: { "x-requested-with": "XMLHttpRequest" },
				body: JSON.stringify({
					"pid": pid, //ID поста
					"smile_id": sid //ID смайла
				})
			}).then(r => r.json());
		},
		
		// Нахожу смайл того, кого процитировали
		getQuoteRatedUsers: async function () {
			let info = this.getInf(), result = [];

			for (let item of info) {
				let m = item.mentions, p = item.postInf, q = item.quoteInf;
				for (let smile of item.smiles) {
					let s = smile;
					
					let res = await this.getUsers(p.pid, s.sid).then(response => {
						let uids = response.map(a => a['link'].split('.')[1]);
						if (m.length != 0) {
							for (let id of m) {
								if (uids.find(i => id.uid == i) != undefined && id.uid != Utils.user_id) {
									result.push({
										post: {
											dom: p.post, //DOM поста
											id: p.pid //ID поста
										},
										user: {
											quote: 1, //наличие цитат
											mention: 1, //наличие суммонов
											name: id.name, //имя пользователя
											id: id.uid //ID пользователя
										},
										smile: {
											title: s.title, //имя смайла-оценки
											id: s.sid, //ID смайла-оценки
											image: s.image //картинка смайла
										}
									});
								}
							}
						}

						for (let id of q) {
							if (uids.find(i => id.uid == i) != undefined && id.uid != Utils.user_id) {
								result.push({
									post: {
										dom: p.post, //DOM поста
										id: p.pid //ID поста
									},
									user: {
										quote: 1, //наличие цитат
										mention: 0, //наличие суммонов
										name: id.name, //имя пользователя
										id: id.uid //ID пользователя
									},
									smile: {
										title: s.title, //имя смайла-оценки
										id: s.sid, //ID смайла-оценки
										image: s.image //картинка смайла
									}
								});
							}
						}
					});
				}
			}

			return result;
		},

		// Нахожу смайл автора темы под сообщением без цитат
		getAuthorsSmile: async function () {
			let info = this.getInfEmptyPosts(), result2 = [];
			for (let item of info) {
				let p = item.postInf, m = item.mentions;
				for (let smile of item.smiles) {
					let s = smile;
					
					let res = await this.getUsers(p.pid, s.sid).then(response => {
						let uids = response.map(a => a['link'].split('.')[1]);
						let marker = 0; //метка для поста без цитаты с сумоном автора темы и его смайлом под постом
						if (m.length != 0) {
							for (let id of m) {
								if (uids.find(i => id.uid == i) != undefined && id.uid != Utils.user_id) {
									result2.push({
										post: {
											dom: p.post, //DOM поста
											id: p.pid //ID поста
										},
										user: {
											quote: 0, //наличие цитат
											mention: 1, //наличие суммонов
											name: id.name, //имя пользователя
											id: id.uid //ID пользователя
										},
										smile: {
											title: s.title, //имя смайла-оценки
											id: s.sid, //ID смайла-оценки
											image: s.image //картинка смайла
										}
									});
								}
								if (id.uid == Topic.user_id) marker = 1; //метка
							}
						}
						if (marker != 0) return;
						for (let id of uids) {
							if (id == Topic.user_id) {/*
								if (m.length != 0) {
									console.log(m);
									console.log(Topic.user_id);
									if (m.find(i => Topic.user_id == i) != undefined) {
										console.log('check');
										return;
									}
								}*/
								result2.push({
									post: {
										dom: p.post, //DOM поста
										id: p.pid //ID поста
									},
									user: {
										quote: 0, //наличие цитат
										mention: 0,	//наличие суммонов
									},
									smile: {
										title: s.title, //имя смайла-оценки
										id: s.sid, //ID смайла-оценки
										image: s.image //картинка смайла
									}
								});
							}
						}
					})
				}
			}
			
			return result2;
		},
		
		render: (post, user, smile) => {
			let rated = post.querySelector('div[id|="post-rated-list"]');
			
			if (!rated.querySelector(`[data-name="${user.name}"]`)) {
				let title = document.createElement('p');
				title.style = "padding: 2px 6px; background: #363636; color: #dedede; border-radius: 3px; margin-top: 6px;";
				title.setAttribute('data-name', user.name);
				if (user.mention == 1) {
					title.innerHTML = `<b>${user.name}</b> отреагировал на упоминание - <img src="${smile}">`;
				} else if (user.quote == 0) {
					title.innerHTML = `<b>Автор темы</b> отреагировал на пост - <img src="${smile}">`;
				} else {
					title.innerHTML = `<b>${user.name}</b> отреагировал на цитирование - <img src="${smile}">`;
				}
				
				rated.append(title);
			}
		},
		
		init: async function () {
			if (window.location.pathname.match(/forum\/threads/)) {
				let result = [],
				list = await this.getQuoteRatedUsers().then(e => {
					result = e;
				});
				for (let i of result) {
					this.render (i.post.dom, i.user, i.smile.image);
				}
				
				if (Topic.user_id != Utils.user_id) {
					let result2 = [],
					list2 = await this.getAuthorsSmile().then(a => {
						result2 = a;
					});
					for (let i of result2) {
						this.render (i.post.dom, i.user, i.smile.image);
					}
				}
			}
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

		appendToSessionStorage: function (name, data) {
			let old = sessionStorage.getItem(name);
			if (old == null) {
				old = "";
				sessionStorage.setItem(name, data);
			} else {
				if (old.indexOf(data) !== ~false) {
					return;
				}
				sessionStorage.setItem(name, old + ',' + data);
			}
		},
		
		getQuotedIDs: function () {
			let messages = this.getMessages(),
				removedMessages = this.getRemovedIDs(messages),
				result = [];

			if (removedMessages.length == 0) return;
			this.appendToSessionStorage('deleted_ids', removedMessages);
			let cache_ids = sessionStorage.getItem('deleted_ids');
			
			/*let _cache_ids = cache_ids.split(',');			//статистика
			console.log(cache_ids);
			console.log("Удалённых постов в теме: " + _cache_ids.length);*/

			for (let message of messages) {
				let quotes = message.querySelectorAll(`div.bbCodeQuote[data-post-id]`);

				if (quotes !== null) {
					for (let el of quotes) {
						let id = el.dataset.postId;

						if (cache_ids.indexOf(id) !== ~false) {
							result.push(message.dataset.id);
						}
					}
				}
			}

			return result;
		},
		
		init: function () {
			if (window.location.pathname.match(/forum\/threads\//)) {
				let posts = this.getQuotedIDs();
				if (posts == undefined) return;
				for (let el of posts) {
					let elem = document.getElementById(`post-${el}`);
					elem.classList.add('asmund-find');
				}
			}
		}
	},




	/* Избранные смайлы под постом */
	/*								*/
	/********************************/
	favoritesEmotions: {
        getPinned: () => {
            let pinned = localStorage.getItem('asmund-pinned-emotions');
			return pinned !== null ? JSON.parse(pinned) : [/*{
				id: 1033,
				src: "/img/forum/emoticons/FeelsClownMan.png?1552738440",
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
			},
			{
				id: 721,
				src: "/img/forum/emoticons/roflanLico.png"
			},
			{
				id: 400,
				src: "/img/forum/emoticons/roflanFacepalm.png"
			}*/]
		},
		
		addToLocalStorage: (item) => {
			let n = localStorage.getItem('asmund-pinned-emotions');
			if (n == null) {
				localStorage.setItem('asmund-pinned-emotions', '[' + item + ']');
			} else {
				let n = localStorage.getItem('asmund-pinned-emotions');
				localStorage.setItem('asmund-pinned-emotions', n.slice(0, -1) + ',' + item + ']');
			}
		},

		deleteFromLocalStorage: function (item) {
			let n = localStorage.getItem('asmund-pinned-emotions');
			if (n.indexOf(item + ',') !== ~false) {
				n = n.replace(item + ',', '');
			} else if (n.indexOf(',' + item + ']') !== ~false) {
				n = n.replace(',' + item, '');
			} else if (n.indexOf('[' + item + ']') !== ~false) {
				localStorage.removeItem('asmund-pinned-emotions');
				return;
			}
			localStorage.setItem('asmund-pinned-emotions', n);
		},
        
        render: (dom, smile) => {
			let a = document.createElement('a');
			a.setAttribute('data-asmund-sid', smile.id);
			a.setAttribute('onclick', `javascript:Topic.setPostRate(${dom.id}, ${smile.id}, '${smile.src}'); return false;`);
			a.innerHTML = `<img class="asmund-preview-smiles" src="${smile.src}">`;
            dom.post.append(a);
		},

		unRender: function (button) {
			button.parentNode.removeChild(button);
		},

		/**
		* Следит за появлением объекта в DOM сайта
		* Цикл не прекращается, если указан флаг bool
		*
		* @param string elem
		* @param function callback
		* @param boolean bool
		*/ 
		watching: function ({doc, elem, callback, bool}) {
			let interval = setInterval(() => {
				doc = (doc)? doc : document;
					
				if (el == doc.querySelector(`${elem}:not(.watched)`)) {
					callback(el);
					el.classList.add('watched');
						
					if (!bool) clearInterval(interval);
				}
			}, 100);
		},

		addsmiles: function () {
			let f_post = document.querySelector('.message-list > li:not(.upPost)');
			let id = f_post.dataset.id;
			let button = f_post.querySelector('.rate-btn-plus.item.control.rate-btn');
			if (button == null) return;
			let That = this;
			button.onclick = function () {		//кнопка с плюсом
				Topic.ratePost(id,this);
				let nodelist = document.querySelectorAll("#modal_phone_wrapper > header > nav > a");
				let categories = Array.from(nodelist);
				console.log(categories);
				for (let cat of categories) {		//категории смайлов
					cat.onmousedown = function () {
						setTimeout(function () {
							let interval = setInterval(function () {
								let list = document.querySelectorAll('.tab_panel div');
								console.log(list);
								for (let n of list) {				//смайлы
									n.onmousedown = function (e) {
									//n.addEventListener('mousedown', e => {
										if (e.shiftKey) {
											//e.stopPropagation();
											//e.preventDefault();
											let div = n.firstElementChild;
											let href = div.getAttribute('href');
											let id = href.match(/\d+/g);
											div.removeAttribute('href');
											let img = div.firstElementChild;
											let src = img.getAttribute('src');
											let smile = {
												id: id[1],
												src: src
											}
											let json = JSON.stringify(smile);
											That.addToLocalStorage(json);
											That.render({
												post: f_post.querySelector('.fav-smiles'), 
												id: id
											}, smile);
											That.deleteSmiles();
										}
									}
								}
							}, 100);
							setTimeout(() => { clearInterval(interval); }, 500);
						}, 500);
					}
				}


				/*const element = document.querySelector('.phone_wrapper');
				//console.log(element);
				That.watching ({
					//doc: element,
					elem: '.tab_panel div',
					callback: function (el) {
						//console.log(el.classList);
						for (let cat of categories) {
							cat.addEventListener("click", () => {
								let list = document.querySelectorAll('.tab_panel div');
								for (let n of list) {
									//n.onmousedown = function (e) {
									n.addEventListener('mousedown', e => {
										if (e.shiftKey) {
											e.stopPropagation();
											e.preventDefault();
											let div = n.firstElementChild;
											let href = div.getAttribute('href');
											let id = href.match(/\d+/g);
											//div.removeAttribute('href');
											let img = div.firstElementChild;
											let src = img.getAttribute('src');
											let smile = {
												id: id[1],
												src: src
											}
											let json = JSON.stringify(smile);
											That.addToLocalStorage(json);
											That.render({
												post: f_post.querySelector('.fav-smiles'), 
												id: id
											}, smile);
											That.deleteSmiles();
										}
									})
								}
							});
						}
					}
				});*/

				/*let list = document.querySelectorAll('.tab_panel div');
				for (let n of list) {
					//n.onmousedown = function (e) {
					n.addEventListener('mousedown', e => {
						if (e.shiftKey) {
							e.stopPropagation();
      						e.preventDefault();
							let div = n.firstElementChild;
							let href = div.getAttribute('href');
							let id = href.match(/\d+/g);
							//div.removeAttribute('href');
							let img = div.firstElementChild;
							let src = img.getAttribute('src');
							let smile = {
								id: id[1],
								src: src
							}
							let json = JSON.stringify(smile);
							That.addToLocalStorage(json);
							That.render({
								post: f_post.querySelector('.fav-smiles'), 
								id: id
							}, smile);
							That.deleteSmiles();
						}
					})
				}*/
			};
		},

		deleteSmiles: function () {
			let f_post = document.querySelector('.message-list > li:not(.upPost)');
			let smiles = f_post.querySelectorAll('.fav-smiles a');
			for (let button of smiles) {
				let That = this;
				button.onmousedown = function (e) {
					if (e.shiftKey) {
						let id = button.getAttribute('data-asmund-sid');
						let img = button.firstElementChild;
						let src = img.getAttribute('src');
						let smile = {
							id: id,
							src: src
						}
						let json = JSON.stringify(smile);
						That.deleteFromLocalStorage(json);
						That.unRender(button);
					}
				}
			}
		},

        init: function () {
			if (window.location.pathname.match(/forum\/threads/)) {
				this.addsmiles();
				let holderList = document.querySelectorAll('.message-list > li:not(.upPost)'), smiles = this.getPinned();
				let div = document.createElement('div');
				div.className = "fav-smiles";
				$(".postDataHolder").append(div);
				for (let holder of holderList) {
					if (holder.dataset.userId != Utils.user_id) {
						for (let smile of smiles) {
							this.render({
									post: holder.querySelector('.fav-smiles'), 
									id: holder.dataset.id
								}, 
								smile
							);
						}
					}
				}
				this.deleteSmiles();
			}
        }
    },





	/***  Поиск матерных слов в постах ***/
	searchBadWords: {
		// Список trigger слов
		trigger: ['del(?!\\S)', 'delete', /*'(?<!а|в|г|е|з|и|о|с|т|я)д[еа]л(?!е|ё|о|ь|у|а)',*/ '(?<!ма|шу)хер(?!т|сон|он|ыч|одмг)', '(?<!тра)ху[йяеёил](?!иган|ьн)', 'пизд',
		'(?<!ме|й|о|а|ми|ив|и|р|у|спав|тон|це)нах(?!од|рен|в|ал|ож|од|л)', '(?<!)пох(?!о|в|и|уж|л|уд|ук|айп|ав|рен|арас|ейт)', 'у[её]б', 'сук(?!куб)',
		'(?<!м|ч|р|к|л|н|ст|ге|д|с|т|в|ш|г|щ|ж)[ёе]б[ауеиы ]?(?!рд|ф|ю|ст)', '(?<!ре|р|а|у|до|ор)бля(?!е|й)', 'д[оа]лб[ао][её]б', /*'(?<!85/100)\\*(?!\\w|не активно)',*/
		'(?<!\\w)\\#(?!\\w|дозор|\\\\|"|\/)'], //

         // Применяемые стили на найденные слова
        styles: [
            //'border: 1px dashed green',
            //'color: #fff',
            //'padding: 1px 4px',
			//'margin: -2px -5px'

			'background: #78cc66',
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
               
				console.log("Сайт: " + site + " Окно: " + wind);
                for (let item of list) {
					//console.log(item);
					let y = item.getClientRects()[0].top, eltop = (y / site) * wind; // element top
                       
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
				this.fullHeight = document.querySelector('body').offsetHeight;
				/*this.fullHeight = Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.body.clientHeight, document.documentElement.clientHeight
				);*/
				this.windowHeight = window.innerHeight;
				//this.windowHeight = document.documentElement.clientHeight;
				console.log(this.fullHeight);
				console.log(this.windowHeight);
               
                this.canvas = document.createElement('canvas');
                this.canvas.style = 'position: fixed; right: 0; top: 0; width: 20px; height: 100%';
                this.canvas.setAttribute('width', '20px');
                this.canvas.setAttribute('height', `${this.windowHeight}px`);
               
                let list = this.list,
                    sp = this.fullHeight / this.divider, // site percent
                    wp = this.windowHeight / this.divider; // window percent
                   
                   
                this.render(list, sp, wp);
            }
        },
       
         // Генератор regexp на основе trigger слов
        regexp: function () {
            return new RegExp(`(${this.trigger.join('|')})`, 'ig')
        },
       
         // Получение всех строк
        getStrs: () => {
			return [...document.querySelectorAll('.message.staff')]; // посты
		},
		
		getStrsPremod: () => {
            return [...document.querySelectorAll('.snippet.messageInfo.secondary-content.premoderation p')]; // премоды
        },
         
         // Инициализация модуля
        init: function () {
			let strs = this.getStrs(),
				strsPremod = this.getStrsPremod(),
                rexp = this.regexp(),
                styles = this.styles.join('; ');
			if (strs.length != 0) {
				for (let str of strs) {
					let _str = str.querySelectorAll('.messageText.baseHtml:not(.signature) p');
					for (let __str of _str) {
						if (rexp.test(__str.innerHTML)) {
							__str.innerHTML = __str.innerHTML.replace(rexp, `<span style="${styles}">\$1</span>`);
							__str.style = "background: #f1c40f; color: #000000";
							if (str.classList.contains("deleted") == false) {
								this.renderInfo.list.push(__str);
							}
						}
					}
				}
				this.renderInfo.init();
			}
			if (strsPremod.length != 0) {
				for (let str of strsPremod) {
					if (rexp.test(str.innerHTML)) {
						str.innerHTML = str.innerHTML.replace(rexp, `<span style="${styles}">\$1</span>`);
						str.style = "background: #f1c40f; color: #000000";
						this.renderInfo.list.push(str);
					}
				}
				this.renderInfo.init();
			}
        }
	},
	



	/** Проверка подписей **/
	checkSignature: {
		accessHeight: 225,

		checkSignature: function (item) {
			if (item.clientHeight > this.accessHeight) {
				console.log("Высота подписи:", item.clientHeight);
				item.classList.add('user_signature');
			}
		},

		checkSignature_profile: function (item) {
			if (item.clientHeight > this.accessHeight) {
				console.log("Высота подписи:", item.clientHeight);
				item.classList.add('user_signature_profile');
			} else {
				console.log("Высота подписи:", item.clientHeight);
			}
		},

		init: function () {
			if (window.location.pathname.match(/forum\/threads\//)) {
				document.querySelectorAll('blockquote.signature').forEach(a => this.checkSignature(a))
				return;
			}
			if (window.location.pathname.match(/\/members\//)) {
				document.querySelectorAll('blockquote.signature').forEach(a => this.checkSignature_profile(a))
			}
		}
	},




	/** Проверка на две темы с Стримах **/
	checkStream: {
		init: function () {
			if (window.location.pathname.match(/forum\/forums\/strimy\.20\//)) {
				const nicks = document.querySelectorAll('.posterDate.muted .username');
				const Nicks = Array.from(nicks);

				let i, j, k = Nicks.length;
				for (i = 0; i < k; i++) {
					for (j = i + 1; j < k; j++) {
						if (Nicks[i].innerHTML == Nicks[j].innerHTML) {
							let h = 0;
							document.querySelectorAll('.discussionListItems li').forEach(el => {
								if (h == i || h == j) {
									el.style.setProperty('opacity', '0.3');
								}
								h++;
							});
						}
					}
				}
			}
		}
	},




	openTopics: {
		open: function () {
			let i = 0;
			document.querySelectorAll('.discussionListItems .title a').forEach(el => {
				let link = el;
				window.open(link);
				this.sleep(2000);
				i++;
				if (i == 2) {
					throw BreakException;
				}
			});
		},

		sleep: function (milliseconds) {
			let start = new Date().getTime();
			for (let i = 0; i < 1e7; i++) {
				if ((new Date().getTime() - start) > milliseconds) {
					break;
				}
			}
		},

		init: function () {
			this.open();
		}
	},
	


	statistics: {
		addToLocalStorage: function (item) {
			let n = localStorage.getItem(item);
			if (n === null) n = 0;
			n++;
			localStorage.setItem(item, n);
			//console.log(`${item}: ` + localStorage.forum);
		},

		init: function () {
			/*document.querySelector('.page-title').onclick = () => {
				this.addToLocalStorage('forum');
			}*/
		}
	},




	dislikes: {
		addToSessionStorage: function (item) {
			let n = sessionStorage.getItem(item);
			if (n === null) n = 0;
			n++;
			sessionStorage.setItem(item, n);
		},

		addNickToSessionStorage: function (item) {
			let n = sessionStorage.getItem('arr_of_nicks');
			if (n === null) {
				sessionStorage.setItem('arr_of_nicks', item);
				return;
			}
			n = n.split(',');
			if (n.includes(item)) {
				return;
			} else {
				n = n.join();
				sessionStorage.setItem('arr_of_nicks', n + ',' + item);
			}
		},

		console_log: function () {
			let nicks = sessionStorage.getItem('arr_of_nicks');
			if (nicks == null) {
				return;
			}
			nicks = nicks.split(',');
			for (let nick of nicks) {
				//if (sessionStorage.getItem(nick) > 10) {
					console.log('Поставил ' + sessionStorage.getItem(nick) + ' дизрапторов ' + `${nick}`);
				//}
			}
		},

		count: function () {
			let array = sessionStorage.getItem('arr_of_nicks');
			if (array == null) {
				array = [];
			} else {
				array = array.split(',');
			}
			document.querySelectorAll('.stream-item').forEach(el => {
				let a = el.querySelector('.list-inline.stream-meta.muted').innerHTML;
				if (a.indexOf("Dislike.png") !== ~false) {
					let b = el.querySelector('.user-photo.user-photo-mini').innerHTML;
					let nick = b.match(/(?<=alt=").*(?=">)/);
					if (array.includes(nick[0])) {
						;
					} else {
						this.addNickToSessionStorage(nick[0]);
					}
					this.addToSessionStorage(`${nick}`);
				}
			});
			this.console_log();
		},

		init: function () {
			if (window.location.pathname.match(/forum\/members\/.*\/likes\/my-rate/)) {
				this.count();
			}
		}
	},



	//notification_Helper: {
		//request: async function (url, id) {
			/*let xhr = new XMLHttpRequest();
			xhr.open('GET', 'https://dota2.ru/forum/posts/24556181/', true);
			let result;
			xhr.addEventListener('readystatechange', function() {
				if ((xhr.readyState == 4) && (xhr.status == 200)) {
					result = xhr.responseText;
				}
			});
			xhr.send();
			return result;*/
			/*let response = await fetch (url);
			let html = await response.text();
			let temp = document.createElement('div');
			temp.innerHTML = html;
			let post = temp.querySelector(`#post-${id}`);
			return {
				smiles: [...post.querySelectorAll('.post-smiles-content a')].map(b => {
					return {
						count: b.dataset.smileCount,
						sid: b.dataset.smileId,
						title: b.querySelector('img').getAttribute('title'),
						image: b.querySelector('img').getAttribute('src')
					}
				})
			}
		},

		emotes: async function () {
			let url = 'https://dota2.ru/forum/posts/24556181/';
			let id = 24556181;
			let emotes = this.request(url, id);
			let result = [];
			console.log(emotes);
			let user_id = 733467;
			class Waiter {
			async wait() {
			Promise.all([emotes]).then(smiles => {
				for (let item of emotes) {
					console.log("-----------");
					for (let smile of item.smiles) {
						let s = smile;
						let res = await this.getUsers(id, s.sid).then(response => {
							let uids = response.map(a => a['user.id']);
							for (let nick of uids) {
								if (nick == user_id) {
									result.push({
										smile: {
											title: s.title, // Имя смайла-оценки
											id: s.sid, // ID смайла-оценки
											image: s.image //Картинка смайла
										}
									});
								}
							}
						})
					}
				}
			});
		}
			}
			console.log(result);
			return result;
		},

		getUsers: (pid, sid) => {
			return fetch("/forum/api/forum/getUsersWhoRatePost", {
				method: "POST",
				headers: { "x-requested-with": "XMLHttpRequest" },
				body: JSON.stringify({
					"pid": pid, // ID поста
					"smileId": sid // ID эмоции
				})
			}).then(r => r.json()); // Тут допишешь проверку на 200/40/50*, вынести в отдельную ф-ию
		},

		init: function () {
			this.emotes();
		}
	},*/



	ipCheck: {
		request: async function (id) {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', `https://dota2.ru/forum/members/.${id}/`);
			xhr.responseType = 'text';
			let result;
			xhr.addEventListener('readystatechange', function () {
				if ((xhr.readyState == 4) && (xhr.status == 200)) {
					result = xhr.responseText;
					//console.log(result);
				}
			});
			console.log(result);
			xhr.send();
			return result;
		},

		proxycheck: function (id) {
			let result = this.request(id);
			console.log(result);
		},

		init: function () {
			if (Utils.groupName != "Супермодератор") {
				return;
			}
			let id = 810832;
			this.proxycheck(id);
		}
	},



	delete_smile_check: {
		init: function () {
			let delete_nick = "Ned_Stark";
			document.querySelectorAll('.stream-item').forEach(el => {
				let nick = el.querySelector("#like-post- > div > div.stream-item-header > a > img");
				nick = nick.getAttribute('alt');
				if (nick != delete_nick) {
					el.parentNode.removeChild(el);
				}
			});
		}
	},


	
	test: {
		init: function () {
			console.log("Скрипт выполнился до самого конца");
			//let n = document.querySelector('.default-rate');
			/*n.addEventListener('keydown', function (e) {
				if (e.shiftKey) {
					n.onclick = function (a) {
						if (a.button == 0) {
							//a.preventDefault();
							console.log("~~~~~");
							//return false;
						}
					}
				}
			});*/
			/*n.onmousedown = function (e) {
				if (e.shiftKey) {
					n.removeAttribute('href');
					console.log("||||||");
				}
			}*/
		}
	},


	

     /*** Общая инициализация компонентов ***/
    init: function () {
		this.highlight.init();
		this.quote_emotions.init();
		this.removeHelper.init();
		this.favoritesEmotions.init();
		this.searchBadWords.init();
		//this.checkSignature.init(); //подписей нет (24.10.20)
		this.checkStream.init();
		//this.openTopics.init();
		this.statistics.init();
		this.dislikes.init();
		//this.notification_Helper.init();
		//this.ipCheck.init();
		//this.delete_smile_check.init();
		this.test.init();
    }
}

let al = {
    page: null,
    getPage: function () {
        if (this.page !== null) return this.page;
            this.page = window.location.pathname.match(/(?<=(forum\/))(.*?)(?=\/)/ig)[0];
            return this.page !== null ? this.page : 'mainPage'
    },
}

window.addEventListener('DOMContentLoaded', function() {
	Asmund.init();
})
