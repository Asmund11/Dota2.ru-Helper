let myCtg = {
	// Список категорий для групп пользователей
	modGroupList: {
		"Модератор других игр, CS:GO и разного": ["Другие игры", "Counter-Strike: Global Offensive", "Разное"],
		"Модератор технического раздела": ["Технический раздел"],
		"Модератор основного раздела": ["Основной раздел"]
	},

	// Список форумов в категориях
	categories: {
		"Основной раздел": ["Общие вопросы и обсуждения", "Обитель нытья", "Dota Plus, компендиумы и ивенты", "Обновления и патчи", "Рейтинговая система и статистика", "Герои: общие обсуждения", "Dream Dota", "Нестандартные сборки", "Киберспорт: общие обсуждения", "Игроки и команды", "Турниры, матчи и прогнозы", "Поиск игроков для ммр и паб игр", "Поиск игроков для создания команды", "Поиск команды для совместных игр и участия в турнирах", "Поиск игроков для ивентов и абузов", "Обмен предметами и гифтами", "Обсуждения и цены", "Медиа Dota 2", "Стримы","Развитие портала"],
		"Counter-Strike: Global Offensive": ["[CS:GO] Общие вопросы и обсуждения", "[CS:GO] Обновления и патчи", "[CS:GO] Киберспорт", "[CS:GO] Обменник"],
		"Технический раздел": ["Техническая поддержка по Dota 2", "Железо и обсуждения", "Сборка ПК, значительный апгрейд", "Выбор комплектующих, ноутбуков, консолей", "Компьютерная помощь по остальным вопросам", "Игровые девайсы, периферия и прочая техника", "Мобильные девайсы", "Софт и прочие технические вопросы", "Steam", "Программирование"],
		"Другие игры": ["Другие игры", "The Elder Scrolls", "Path of Exile", "Shooter, Battle Royale", "Apex Legends", "ККИ", "Hearthstone", "Artifact", "League of Legends", "MMO (RPG, FPS, RTS)", "World of Warcraft", "Dota Underlords", "Dota Auto Chess", "Консольные игры", "Мобильные игры"],
		"Разное": ["Таверна", "Творчество", "Музыка", "Кино и сериалы", "Аниме и прочее", "Спорт", "Книги"]
	},
	
	// Получение группы пользователя
	loadGroupName: async () => {
        return await fetch(`/forum/members/${Utils.user_id}/`).then(a => a.text()).then(r => {
            let div = document.createElement('div');
            div.innerHTML = r;

            return div.querySelector('.group').innerHTML.trim();
        });
    },

	// Получить форумы для группы пользователя
	getForums: function () {
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
	
	// Инициализация
	init: function () {
		this.getForums().then(response => {
			document.querySelectorAll('.search-results-list li').forEach(el => {
				let fold = el.querySelector('.meta a[href*="forums/"]').innerHTML;

				if (response.indexOf(fold) === ~false) {
					el.style.setProperty('opacity', '0.4');
				}
			});
		})
	}
}

window.addEventListener('DOMContentLoaded', function() {
    myCtg.init();
 });
