const Asmund = {
	 /**
	  * Highlight - подсветка сообщений раздела модератора
	  */
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

	 /**
	  * Emotions - определение оценки автора цитируемого поста
	  */
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
					
					 // Работаем с promise, не забывай
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
		
		 /*** Отрисовка результата, перепишешь под себя ***/
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
			
			console.log(result);
			
			for (i of result)
				this.render (i.post.dom, i.user.name, i.smile.image);
		}
	},
	

	favorites_emotions: {
		init: function () {
			document.querySelectorAll('.message-list .postDataHolder').forEach(el => {
				//el.after('after');
				let Smiles = document.createElement('li');
				Smiles.style = "padding: 0px 7px; background: #1b1c20; margin-top: 0x;";
				Smiles.style.setProperty('opacity', '0.09');
  				Smiles.innerHTML = '<img src="/img/forum/emoticons/FeelsClownMan.png?1552738440">';
  				el.after(Smiles);
				Smiles.onmouseover = function() {mouseOver()};
				Smiles.onmouseout = function() {mouseOut()};

				function mouseOver() {
					Smiles.style.setProperty('opacity', '1.0');
				}

				function mouseOut() {
					Smiles.style.setProperty('opacity', '0.08');
				}
			});
		}
	},

	 /*** Общая инициализация компонентов ***/
	init: function () {
		this.highlight.init();
		this.emotions.init();
		this.favorites_emotions.init();
	}
}

window.addEventListener('DOMContentLoaded', function() {
    Asmund.init();
})
