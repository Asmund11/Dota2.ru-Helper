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
			"Технический раздел": ["Техническая поддержка по Dota 2", "Железо и обсуждения", "Сборка ПК, значительный апгрейд", "Выбор комплектующих, ноутбуков, консолей", "Компьютерная помощь по остальным вопросам", "Игровые девайсы, периферия и прочая техника", "Мобильные девайсы", "Софт и прочие технические вопросы", "Steam", "Программирование"],
			"Другие игры": ["Другие игры", "The Elder Scrolls", "Path of Exile", "Shooter, Battle Royale", "Apex Legends", "ККИ", "Hearthstone", "Artifact", "League of Legends", "MMO (RPG, FPS, RTS)", "World of Warcraft", "Dota Underlords", "Dota Auto Chess", "Консольные игры", "Мобильные игры"],
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

				for (cat in this.categories) {
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

		// Все посты без цитат
		getInfEmptyPosts: () => {
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
			}).filter(d => d.quoteInf.length == 0 && d.smiles.length > 0); // И фильтруем от "пустых" ячеек и постов с цитатами
	   },

	   getTopicStarter: () => {
			return [document.querySelector('.muted.page-description .username').innerHTML]
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

		// Нахожу смайл автора темы под сообщением без цитаты
		getAuthorsSmile: async function () {
			let info = this.getInfEmptyPosts(), result2 = [];
			var ts = this.getTopicStarter(); // Автор темы
			for (item of info) {
				for (smile of item.smiles) {
					let p = item.postInf, s = smile;
					
					let res = await this.getUsers(p.pid, s.sid).then(response => {
						// Собираю ники
						let nicks = response.map(a => a['user.username']);

						for (nick of nicks) {
							if (nick.indexOf(ts) !== ~false) {
								result2.push({
									post: {
										dom: p.post, // DOM поста
										id: p.pid // ID поста
									},
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
			
			return result2;
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
			if (window.location.pathname.match(/threads\//)) {
				let result = [],
				list = await this.getQuoteRatedUsers().then(e => {
					result = e; // Для твоего удобства вывел из promise в синхрон
				});

				let result2 = [],
				list2 = await this.getAuthorsSmile().then(a => {
					result2 = a;
				});
				
				//console.log(result);
				
				for (i of result)
					this.render (i.post.dom, i.user.name, i.smile.image);

				for (i of result2)
					this.render (i.post.dom, 'Автор темы', i.smile.image);
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
			var old = sessionStorage.getItem(name);
			if (old === null) old = "";
			sessionStorage.setItem(name, old + data);
		},
		
		getQuotedIDs: function () {
			let messages = this.getMessages(),
				removedMessages = this.getRemovedIDs(messages),
				result = [];
				this.appendToSessionStorage('ids', removedMessages);
				var cache_ids = sessionStorage.getItem('ids');
				//console.log(cache_ids);
		
			for (message of messages) {
				let quotes = message.querySelectorAll(`div.bbCodeQuote[data-post-id]`);

				if (quotes !== null) {
					for (el of quotes) {
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
			},
			{
				id: 721,
				src: "/img/forum/emoticons/roflanLico.png"
			}]
        },
        
        render: (dom, smile) => {
			let a = document.createElement('a');
            a.setAttribute('data-asmund-sid', smile.id);
			a.setAttribute('onclick', `javascript: Topic.setPostRate(${dom.id}, ${smile.id}); return false;`);
			a.innerHTML = `<img class="asmund-preview-smiles" src="${smile.src}">`;

            dom.post.append(a);
		},

		addsmiles: () => {
			let f_post = document.querySelector('.message-list > li:not(.upPost)'); //для первого
			let button = f_post.querySelector('.rate-btn-plus.item.control.rate-btn');
			button.setAttribute('oncontextmenu', `javascript: Topic.ratePost(${f_post.dataset.id},this); return false;`);

			

			/*let holderList = document.querySelectorAll('.message-list > li');
			for (let holder of holderList) { //для каждого поста
				let button = holder.querySelector('.rate-btn-plus.item.control.rate-btn');
				if (button)
					button.setAttribute('oncontextmenu', `javascript: Topic.ratePost(${holder.dataset.id},this); return false;`);
			}*/
		},

        init: function () {
			if (window.location.pathname.match(/forum\/threads/)) {
				let holderList = document.querySelectorAll('.message-list > li'), smiles = this.getPinned();
				//this.addsmiles();
				let div = document.createElement('div');
				div.className = "fav-smiles";
				$(".postDataHolder").append(div);
				for (holder of holderList) {
					for (smile of smiles) {
						this.render({
								post: holder.querySelector('.fav-smiles'), 
								id: holder.dataset.id
							}, 
							smile
						);
					}
				}
			}
        }
    },





	/***  Поиск матерных слов в постах ***/
	searchBadWords: {
		// Список trigger слов
		trigger: ['del(?!\\S)', 'delete', /*'(?<!а|в|г|е|з|и|о|с|т|я)д[еа]л(?!е|ё|о|ь|у|а)',*/ '(?<!ма|шу)хер(?!т|сон|он|ыч|одмг)', 'ху[йяеёил](?!иган|ьн)', 'хули', 'пизд',
		'(?<!ме|й|о|а|ми|ив|и|р|у|спав|тон)нах(?!од|рен|в|ал|ож|од|л)', '(?<!)пох(?!о|в|и|уж|л|уд|ук|айп|ав|рен|арас|ейт)', 'уеб', 'сук',
		'(?<!м|ч|р|к|л|н|ст|ге|д|с|т|в)[ёе]б[ауеиы ]?(?!рд|ф|ю|ст)', '(?<!ре|р|а|у|до|ор)бля(?!е|й)', 'д[оа]лб[ао][её]б', '(?<!85/100)\\*(?!\\w|не активно)',
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
               
                //console.log(list);
               
                for (item of list) {
                    let y = item.getClientRects()[0].top,
                        eltop = (y / site) * wind; // element top
                       
                    //console.log(y, eltop);
                       
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
                   
                //console.log(list);
                   
                this.render(list, sp, wp);
            }
        },
       
         // Генератор regexp на основе trigger слов
        regexp: function () {
            return new RegExp(`(${this.trigger.join('|')})`, 'ig')
        },
       
         // Получение всех строк
        getStrs: () => {
            return [...document.querySelectorAll('#message-list:not(.deleted) p')]; // посты в темах
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
				for (str of strs) {
					if (rexp.test(str.innerHTML)) {
						str.innerHTML = str.innerHTML.replace(rexp, `<span style="${styles}">\$1</span>`);
						str.style = "background: #f1c40f; color: #000000";
						this.renderInfo.list.push(str);
					}
				}
				this.renderInfo.init();
			}
			if (strsPremod.length != 0) {
				for (str of strsPremod) {
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




	checkStream: {
		init: function () {
			if (window.location.pathname.match(/forum\/forums\/strimy\.20\//)) {
				const nicks = document.querySelectorAll('.posterDate.muted .username');
				const Nicks = Array.from(nicks);

				var i, j, k = Nicks.length;
				for (i = 0; i < k; i++) {
					for (j = i + 1; j < k; j++) {
						if (Nicks[i].innerHTML == Nicks[j].innerHTML) {
							var h = 0;
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
			var i = 0;
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
			var start = new Date().getTime();
			for (var i = 0; i < 1e7; i++) {
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
			var n = localStorage.getItem(item);
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
			var n = sessionStorage.getItem(item);
			if (n === null) n = 0;
			n++;
			sessionStorage.setItem(item, n);
			//console.log('Поставил дизрапторов ' + `${item}: ` + n);
		},

		console_log: function (nicks) {
			for (nick of nicks) {
				console.log('Поставил ' + sessionStorage.getItem(nick) + ' дизрапторов ' + `${nick}`);
			}
		},

		count: function () {
			let array = [];
			document.querySelectorAll('.stream-item').forEach(el => {
				var a = el.querySelector('.list-inline.stream-meta.muted').innerHTML;
				if (a.indexOf("Dislike.png") !== ~false) {
					var b = el.querySelector('.user-photo.user-photo-mini').innerHTML;
					var nick = b.match(/(?<=alt=").*(?=">)/);
					if (array.includes(nick[0])) {
						;
					} else {
						//console.log(nick);
						array.push(nick[0]);
					}
					this.addToSessionStorage(`${nick}`);
				}
			});
			console.log(array);
			this.console_log(array);
		},

		init: function () {
			if (window.location.pathname.match(/forum\/members\/.*\/likes\/my-rate/)) {
				this.count();
			}
		}
	},
	


	
	test: {
		init: function () {
			console.log("!!!!!!!!!");
		}
	},


	

     /*** Общая инициализация компонентов ***/
    init: function () {
		this.highlight.init();
		this.emotions.init();
		this.removeHelper.init();
		this.favoritesEmotions.init();
		this.searchBadWords.init();
		this.checkSignature.init();
		this.checkStream.init();
		//this.openTopics.init();
		this.statistics.init();
		this.dislikes.init();
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
