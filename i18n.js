(() => {
 // Each row is English, Russian, Georgian, Simplified Chinese, Spanish.
 const rows = [
 ['YOUR SPACE','ВАШЕ ПРОСТРАНСТВО','შენი სივრცე','你的空间','TU ESPACIO'],
 ['Home','Главная','მთავარი','首页','Inicio'],
 ['Discover','Обзор','აღმოაჩინე','发现','Descubrir'],
 ['Search','Поиск','ძიება','搜索','Buscar'],
 ['Your library','Моя медиатека','შენი ბიბლიოთეკა','音乐库','Tu biblioteca'],
 ['Settings','Настройки','პარამეტრები','设置','Ajustes'],
 ['Settings.','Настройки.','პარამეტრები.','设置','Ajustes.'],
 ['YOUR COLLECTION','ВАША КОЛЛЕКЦИЯ','შენი კოლექცია','你的收藏','TU COLECCIÓN'],
 ['Liked songs','Любимые треки','მოწონებული სიმღერები','喜欢的歌曲','Tus favoritos'],
 ['Your uploads','Мои загрузки','შენი ატვირთვები','上传的音乐','Tus canciones'],
 ['YOUR PLAYLISTS','ВАШИ ПЛЕЙЛИСТЫ','შენი ფლეილისტები','你的歌单','TUS PLAYLISTS'],
 ['Create playlist','Создать плейлист','ფლეილისტის შექმნა','创建歌单','Crear playlist'],
 ['Your next favorite mix starts here.','Здесь начинается ваш новый любимый плейлист.','აქ იწყება შენი ახალი საყვარელი ფლეილისტი.','从这里创建你的专属歌单。','Tu próxima mezcla favorita empieza aquí.'],
 ['A little more you.','Больше вашей музыки.','მეტი შენი მუსიკა.','更有你的风格。','Un poco más de ti.'],
 ['Your songs. Your artwork.','Ваша музыка. Ваши обложки.','შენი სიმღერები. შენი გარეკანები.','你的歌曲，你的封面。','Tus canciones. Tus portadas.'],
 ['Your own corner of music.','Ваш музыкальный уголок.','შენი მუსიკალური კუთხე.','专属于你的音乐角落。','Tu propio rincón musical.'],
 ['+   Upload a song','+   Загрузить трек','+   სიმღერის ატვირთვა','+   上传歌曲','+   Subir canción'],
 ['Upload a song','Загрузить трек','სიმღერის ატვირთვა','上传歌曲','Subir canción'],
 ['Guest listener','Гость','სტუმარი','访客','Oyente invitado'],
 ['Make yourself at home','Чувствуйте себя как дома','იგრძენი თავი შინ','像在家一样自在','Siéntete como en casa'],
 ['Your personal listening space','Ваше музыкальное пространство','შენი მუსიკალური სივრცე','你的专属音乐空间','Tu espacio musical'],
 ['MAKE YOURSELF AT HOME','ЧУВСТВУЙТЕ СЕБЯ КАК ДОМА','იგრძენი თავი შინ','自在聆听','SIÉNTETE COMO EN CASA'],
 ['Your music. Your space','Ваша музыка. Ваш мир','შენი მუსიკა. შენი სივრცე','你的音乐，你的空间','Tu música. Tu espacio'],
 ['Your music. Your space.','Ваша музыка. Ваш мир.','შენი მუსიკა. შენი სივრცე.','你的音乐，你的空间。','Tu música. Tu espacio.'],
 ['A soundtrack for every version of you.','Музыка для любого настроения.','მუსიკა შენი ყოველი განწყობისთვის.','每种心情都有专属旋律。','Una banda sonora para cada versión de ti.'],
 ['GOOD MUSIC, GOOD MOOD','ХОРОШАЯ МУЗЫКА, ОТЛИЧНОЕ НАСТРОЕНИЕ','კარგი მუსიკა, კარგი განწყობა','好音乐，好心情','BUENA MÚSICA, BUEN ÁNIMO'],
 ['THE DAILY ROTATION','НА КАЖДЫЙ ДЕНЬ','ყოველდღიური რჩეულები','每日精选','TU SELECCIÓN DIARIA'],
 ['Find your','Найдите свой','იპოვე შენი','找到你的','Encuentra tu'],
 ['next repeat.','новый хит.','ახალი რჩეული.','下一首单曲循环。','próximo favorito.'],
 ['Big hits. Late-night favorites. Songs that stay.','Большие хиты. Ночные фавориты. Музыка надолго.','ჰიტები. ღამის რჩეულები. დაუვიწყარი სიმღერები.','热门金曲，深夜最爱，难忘旋律。','Grandes éxitos. Favoritos nocturnos. Canciones que se quedan.'],
 ['Your new rotation starts right here.','Новая подборка начинается здесь.','შენი ახალი რჩეულები აქ იწყება.','从这里开启新的循环列表。','Tu nueva selección empieza aquí.'],
 ['Play the mix','Слушать подборку','მოუსმინე ნაკრებს','播放精选','Reproducir mezcla'],
 ['5 tracks · handpicked for you','5 треков · специально для вас','5 სიმღერა · შენთვის შერჩეული','5 首歌曲 · 为你精选','5 canciones · elegidas para ti'],
 ['SIDE A — DAILY ROTATION','СТОРОНА A — НА КАЖДЫЙ ДЕНЬ','მხარე A — ყოველდღიური რჩეულები','A 面 — 每日精选','LADO A — SELECCIÓN DIARIA'],
 ['ON REPEAT','НА ПОВТОРЕ','გამეორებით','单曲循环','EN BUCLE'],
 ['TURN IT UP.','ПРИБАВЬТЕ ГРОМКОСТЬ.','აუწიე ხმას.','调高音量。','SUBE EL VOLUMEN.'],
 ['TUNE EVERYTHING ELSE OUT.','ЗАБУДЬТЕ ОБО ВСЁМ.','დაივიწყე ყველაფერი სხვა.','让世界安静下来。','OLVÍDATE DE TODO LO DEMÁS.'],
 ['All music','Вся музыка','ყველა სიმღერა','全部音乐','Toda la música'],
 ['Made for your rotation','В вашу подборку','შენი ახალი რჩეულები','为你精选','Para tu selección'],
 ['Made for your rotation ↗','В вашу подборку ↗','შენი ახალი რჩეულები ↗','为你精选 ↗','Para tu selección ↗'],
 ['A few favorites to get things started.','Несколько хитов для начала.','რამდენიმე რჩეული დასაწყისისთვის.','从这些精选歌曲开始吧。','Algunos favoritos para empezar.'],
 ['View all →','Смотреть всё →','ყველას ნახვა →','查看全部 →','Ver todo →'],
 ['APPLE MUSIC · PREVIEW','APPLE MUSIC · ФРАГМЕНТ','APPLE MUSIC · ფრაგმენტი','APPLE MUSIC · 试听','APPLE MUSIC · ADELANTO'],
 ['YOUR UPLOAD · FULL TRACK','ВАША ЗАГРУЗКА · ПОЛНЫЙ ТРЕК','შენი ატვირთვა · სრული სიმღერა','你的上传 · 完整歌曲','TU CANCIÓN · COMPLETA'],
 ['+ Playlist','+ В плейлист','+ ფლეილისტში','+ 歌单','+ Playlist'],
 ['Remove','Убрать','ამოშლა','移除','Quitar'],
 ['Show more songs','Показать ещё','მეტი სიმღერის ნახვა','显示更多歌曲','Mostrar más canciones'],
 ['Your favorites belong here.','Ваши любимые треки — здесь.','შენი რჩეულების ადგილი აქაა.','收藏你的最爱。','Aquí están tus favoritos.'],
 ['Bring your own songs. Add a cover. Make it yours.','Загрузите треки. Добавьте обложку. Сделайте их своими.','ატვირთე მუსიკა. დაამატე გარეკანი. მოირგე შენზე.','上传歌曲，添加封面，打造专属音乐库。','Sube tus canciones. Añade portadas. Hazlo tuyo.'],
 ['Add your music','Добавить музыку','შენი მუსიკის დამატება','添加你的音乐','Añade tu música'],
 ['A space for the music you love.','Место для любимой музыки.','ადგილი შენი საყვარელი მუსიკისთვის.','留给热爱音乐的一片空间。','Un espacio para la música que amas.'],
 ['Discover songs are Apple Music previews.','Треки в обзоре — фрагменты Apple Music.','აღმოჩენის სიმღერები Apple Music-ის ფრაგმენტებია.','发现中的歌曲为 Apple Music 试听片段。','Las canciones de Descubrir son adelantos de Apple Music.'],
 ['PREVIEW','ФРАГМЕНТ','ფრაგმენტი','试听','ADELANTO'],
 ['YOUR MUSIC','ВАША МУЗЫКА','შენი მუსიკა','你的音乐','TU MÚSICA'],
 ['No songs here yet.','Здесь пока нет треков.','აქ ჯერ სიმღერები არ არის.','这里还没有歌曲。','Aún no hay canciones.'],
 ['Find songs in Discover and add them to your playlist, or upload your own.','Найдите треки в обзоре и добавьте их в плейлист или загрузите свои.','იპოვე სიმღერები აღმოჩენაში და დაამატე ფლეილისტში, ან ატვირთე შენი მუსიკა.','在发现中找到歌曲并加入歌单，或上传自己的音乐。','Busca canciones en Descubrir y añádelas a tu playlist, o sube las tuyas.'],
 ['Explore Discover','Открыть обзор','აღმოაჩინე მუსიკა','探索音乐','Explorar música'],
 ['Upload music','Загрузить музыку','მუსიკის ატვირთვა','上传音乐','Subir música'],
 ['Your starter songs, likes, playlist picks, and uploads.','Ваши первые треки, любимые песни, плейлисты и загрузки.','შენი საწყისი სიმღერები, მოწონებები, ფლეილისტები და ატვირთვები.','精选歌曲、喜欢的音乐、歌单收藏与上传内容。','Tus canciones iniciales, favoritos, playlists y archivos.'],
 ['The songs you keep coming back to.','Треки, к которым хочется вернуться.','სიმღერები, რომლებსაც ისევ უბრუნდები.','那些让你一听再听的歌曲。','Las canciones a las que siempre vuelves.'],
 ['Your own sound. Your own collection.','Ваш звук. Ваша коллекция.','შენი ჟღერადობა. შენი კოლექცია.','你的声音，你的收藏。','Tu sonido. Tu colección.'],
 ['A soundtrack made by you.','Подборка, созданная вами.','შენ მიერ შექმნილი მუსიკალური ნაკრები.','由你打造的专属旋律。','Una banda sonora hecha por ti.'],
 ['Press play and make yourself at home.','Нажмите «Воспроизвести» и отдыхайте.','ჩართე მუსიკა და იგრძენი თავი შინ.','点击播放，自在聆听。','Dale al play y siéntete como en casa.'],
 ['Listen to official previews. Add any song to your playlists.','Слушайте официальные фрагменты. Добавляйте треки в плейлисты.','მოუსმინე ოფიციალურ ფრაგმენტებს. დაამატე სიმღერები ფლეილისტებში.','收听官方试听，将喜欢的歌曲加入歌单。','Escucha adelantos oficiales. Añade canciones a tus playlists.'],
 ['YOUR PERSONAL MIX','ВАША ПОДБОРКА','შენი პირადი ნაკრები','你的专属精选','TU MEZCLA PERSONAL'],
 ['Play playlist','Слушать плейлист','ფლეილისტის მოსმენა','播放歌单','Reproducir playlist'],
 ['Edit','Изменить','შეცვლა','编辑','Editar'],
 ['Delete','Удалить','წაშლა','删除','Eliminar'],
 ['ARTIST SPOTLIGHT','ИСПОЛНИТЕЛЬ','შემსრულებელი','艺人精选','ARTISTA DESTACADO'],
 ['Play artist','Слушать исполнителя','შემსრულებლის მოსმენა','播放艺人歌曲','Reproducir artista'],
 ['YOUR MUSIC, YOUR WAY','ВАША МУЗЫКА, ВАШИ ПРАВИЛА','შენი მუსიკა, შენი წესებით','你的音乐，你来做主','TU MÚSICA, A TU MANERA'],
 ['Create a playlist.','Создайте плейлист.','შექმენი ფლეილისტი.','创建歌单。','Crea una playlist.'],
 ['Edit your playlist.','Изменить плейлист.','შეცვალე ფლეილისტი.','编辑歌单。','Edita tu playlist.'],
 ['Playlist name','Название плейлиста','ფლეილისტის სახელი','歌单名称','Nombre de la playlist'],
 ['Late-night favorites','Ночные фавориты','ღამის რჩეულები','深夜最爱','Favoritos nocturnos'],
 ['Description','Описание','აღწერა','描述','Descripción'],
 ['(optional)','(необязательно)','(არასავალდებულო)','（可选）','(opcional)'],
 ["What's the mood?",'Какое настроение?','როგორი განწყობაა?','今天是什么心情？','¿Cuál es el ambiente?'],
 ['Saved in this browser. Add songs from Discover or your uploads.','Сохраняется в этом браузере. Добавляйте треки из обзора или загрузок.','ინახება ამ ბრაუზერში. დაამატე სიმღერები აღმოჩენიდან ან ატვირთვებიდან.','保存在此浏览器中。添加发现中的歌曲或自己上传的音乐。','Se guarda en este navegador. Añade canciones de Descubrir o tus archivos.'],
 ['Save changes','Сохранить','ცვლილებების შენახვა','保存更改','Guardar cambios'],
 ['Create and add song','Создать и добавить трек','შექმნა და სიმღერის დამატება','创建并添加歌曲','Crear y añadir canción'],
 ['KEEP IT ON REPEAT','СЛУШАЙТЕ СНОВА','მოუსმინე ისევ','循环你的最爱','QUE NO DEJE DE SONAR'],
 ['Add to playlist.','Добавить в плейлист.','ფლეილისტში დამატება.','添加到歌单。','Añadir a playlist.'],
 ['Already added','Уже добавлено','უკვე დამატებულია','已添加','Ya añadida'],
 ['+ Add','+ Добавить','+ დამატება','+ 添加','+ Añadir'],
 ['+ Create a new playlist','+ Новый плейлист','+ ახალი ფლეილისტი','+ 创建新歌单','+ Crear una playlist'],
 ['Create your first playlist to keep this song.','Создайте первый плейлист для этого трека.','შექმენი პირველი ფლეილისტი ამ სიმღერისთვის.','创建你的第一个歌单，收藏这首歌。','Crea tu primera playlist para guardar esta canción.'],
 ['Give your playlist a name.','Введите название плейлиста.','დაარქვი სახელი ფლეილისტს.','请为歌单命名。','Ponle un nombre a tu playlist.'],
 ['A LITTLE MORE YOU','БОЛЬШЕ ВАШЕЙ МУЗЫКИ','მეტი შენი მუსიკა','更有你的风格','UN POCO MÁS DE TI'],
 ['Bring your music.','Добавьте свою музыку.','მოიტანე შენი მუსიკა.','带上你的音乐。','Trae tu música.'],
 ['Your sound, with your own finishing touches.','Ваша музыка с вашими штрихами.','შენი ჟღერადობა, შენი შტრიხებით.','你的音乐，由你来完善。','Tu sonido, con tus propios detalles.'],
 ['Drop your song here','Перетащите трек сюда','ჩააგდე სიმღერა აქ','将歌曲拖到这里','Arrastra tu canción aquí'],
 ['or','или','ან','或','o'],
 ['browse files','выберите файл','აირჩიე ფაილი','浏览文件','busca un archivo'],
 ['to find your sound','с вашей музыкой','შენი მუსიკის საპოვნელად','找到你的音乐','para encontrar tu sonido'],
 ['MP3, WAV, M4A, FLAC, OGG · One song at a time','MP3, WAV, M4A, FLAC, OGG · По одному треку','MP3, WAV, M4A, FLAC, OGG · თითო სიმღერა','MP3、WAV、M4A、FLAC、OGG · 每次一首','MP3, WAV, M4A, FLAC, OGG · Una canción a la vez'],
 ['Song details and artwork fill in automatically. Everything is editable.','Название и обложка заполняются автоматически. Всё можно изменить.','მონაცემები და გარეკანი ივსება ავტომატურად. ყველაფრის შეცვლა შეგიძლია.','自动填写歌曲信息和封面，所有内容都可编辑。','Los datos y la portada se rellenan automáticamente. Puedes editarlo todo.'],
 ['COVER ART','ОБЛОЖКА','გარეკანი','封面','PORTADA'],
 ['↑ Change photo','↑ Изменить фото','↑ ფოტოს შეცვლა','↑ 更换图片','↑ Cambiar foto'],
 ['Remove photo','Убрать фото','ფოტოს წაშლა','移除图片','Quitar foto'],
 ['Song name','Название трека','სიმღერის სახელი','歌曲名称','Nombre de la canción'],
 ["Your song's title",'Название вашей песни','შენი სიმღერის სახელი','输入歌曲名称','El título de tu canción'],
 ['Artist','Исполнитель','შემსრულებელი','艺人','Artista'],
 ["Who's behind the music?",'Кто исполняет песню?','ვინ ასრულებს სიმღერას?','谁创作了这首音乐？','¿Quién está detrás de la música?'],
 ['Original audio. Full-length listening.','Оригинальный файл. Полный трек.','ორიგინალი აუდიო. სრული სიმღერა.','原始音频，完整播放。','Audio original. Canción completa.'],
 ['Add to a playlist','Добавить в плейлист','ფლეილისტში დამატება','添加到歌单','Añadir a una playlist'],
 ['Just my library','Только в медиатеку','მხოლოდ ბიბლიოთეკაში','仅加入音乐库','Solo mi biblioteca'],
 ['Only on this device.','Только на этом устройстве.','მხოლოდ ამ მოწყობილობაზე.','仅保存在此设备上。','Solo en este dispositivo.'],
 ['Your music stays in your browser.','Музыка хранится в вашем браузере.','შენი მუსიკა რჩება ბრაუზერში.','你的音乐保存在此浏览器中。','Tu música se queda en tu navegador.'],
 ['Add to my music →','Добавить в мою музыку →','ჩემს მუსიკაში დამატება →','添加到我的音乐 →','Añadir a mi música →'],
 ['Reading song details and cover photo…','Читаем данные и обложку…','იკითხება მონაცემები და გარეკანი…','正在读取歌曲信息和封面…','Leyendo datos y portada…'],
 ['Details filled in from your file. Change anything you like.','Данные прочитаны из файла. Меняйте что угодно.','მონაცემები შეივსო ფაილიდან. შეცვალე რაც გინდა.','已从文件中读取信息，你可以任意修改。','Datos obtenidos del archivo. Cambia lo que quieras.'],
 ['No embedded details found. You can add a name, artist, and photo.','В файле нет тегов. Добавьте название, исполнителя и фото.','მონაცემები ვერ მოიძებნა. დაამატე სახელი, შემსრულებელი და ფოტო.','没有找到内嵌信息，你可以添加名称、艺人和图片。','No se encontraron datos. Añade nombre, artista y foto.'],
 ['Choose a song to read its details.','Выберите трек для чтения данных.','აირჩიე სიმღერა მონაცემების წასაკითხად.','选择歌曲以读取信息。','Elige una canción para leer sus datos.'],
 ['Saving…','Сохраняем…','ინახება…','正在保存…','Guardando…'],
 ['MAKE IT FEEL LIKE YOU','НАСТРОЙТЕ ПОД СЕБЯ','მოირგე შენზე','打造你的风格','HAZLO A TU MEDIDA'],
 ['Language','Язык','ენა','语言','Idioma'],
 ['Choose the language that feels like home.','Выберите удобный язык.','აირჩიე შენთვის სასურველი ენა.','选择你最熟悉的语言。','Elige el idioma con el que te sientas en casa.'],
 ['App language','Язык приложения','აპლიკაციის ენა','应用语言','Idioma de la aplicación'],
 ['Changes apply immediately and are remembered on this device.','Изменения вступают в силу сразу и сохраняются на этом устройстве.','ცვლილება მყისიერად მოქმედებს და ინახება ამ მოწყობილობაზე.','更改立即生效，并保存在此设备上。','Los cambios se aplican al instante y se guardan en este dispositivo.'],
 ['Your account','Ваш аккаунт','შენი ანგარიში','你的账号','Tu cuenta'],
 ['Sign in to save your language preference.','Войдите, чтобы сохранить язык в аккаунте.','შედი ანგარიშში ენის შესანახად.','登录以保存语言偏好。','Inicia sesión para guardar tu idioma.'],
 ['Music and playlists stay in this browser.','Музыка и плейлисты хранятся в этом браузере.','მუსიკა და ფლეილისტები რჩება ამ ბრაუზერში.','音乐和歌单保存在此浏览器中。','La música y las playlists se quedan en este navegador.'],
 ['Sign in','Войти','შესვლა','登录','Iniciar sesión'],
 ['Sign out','Выйти','გასვლა','退出登录','Cerrar sesión'],
 ['Create account','Создать аккаунт','ანგარიშის შექმნა','创建账号','Crear cuenta'],
 ['YOUR CORNER OF MUSIC','ВАШ МУЗЫКАЛЬНЫЙ УГОЛОК','შენი მუსიკალური კუთხე','你的音乐角落','TU RINCÓN MUSICAL'],
 ['Welcome back.','С возвращением.','კეთილი იყოს დაბრუნება.','欢迎回来。','Bienvenido de nuevo.'],
 ['Find your groove.','Найдите свой ритм.','იპოვე შენი რიტმი.','找到你的节奏。','Encuentra tu ritmo.'],
 ['Sign in and make yourself at home.','Войдите и чувствуйте себя как дома.','შედი და იგრძენი თავი შინ.','登录，自在享受音乐。','Inicia sesión y siéntete como en casa.'],
 ['A little space for you and your music.','Место для вас и вашей музыки.','სივრცე შენთვის და შენი მუსიკისთვის.','为你和你的音乐留一片空间。','Un espacio para ti y tu música.'],
 ['Your name','Ваше имя','შენი სახელი','你的名字','Tu nombre'],
 ['What should we call you?','Как к вам обращаться?','რა დაგიძახოთ?','我们该如何称呼你？','¿Cómo te llamamos?'],
 ['Email','Эл. почта','ელფოსტა','电子邮箱','Correo electrónico'],
 ['Password','Пароль','პაროლი','密码','Contraseña'],
 ['At least 8 characters','Не менее 8 символов','მინიმუმ 8 სიმბოლო','至少 8 个字符','Al menos 8 caracteres'],
 ['Show','Показать','ჩვენება','显示','Mostrar'],
 ['Hide','Скрыть','დამალვა','隐藏','Ocultar'],
 ['Please wait...','Подождите...','გთხოვ, დაელოდე...','请稍候…','Espera un momento...'],
 ['Your music and playlists are saved in this browser.','Ваша музыка и плейлисты сохраняются в этом браузере.','შენი მუსიკა და ფლეილისტები ინახება ამ ბრაუზერში.','你的音乐和歌单保存在此浏览器中。','Tu música y tus playlists se guardan en este navegador.'],
 ['Search songs, artists, or albums','Поиск треков, исполнителей и альбомов','მოძებნე სიმღერა, შემსრულებელი ან ალბომი','搜索歌曲、艺人或专辑','Busca canciones, artistas o álbumes'],
 ['Search this playlist','Поиск в плейлисте','ძიება ფლეილისტში','搜索此歌单','Buscar en esta playlist'],
 ['Play','Воспроизвести','დაკვრა','播放','Reproducir'],
 ['Pause','Пауза','პაუზა','暂停','Pausar'],
 ['Shuffle','Перемешать','შემთხვევითი რიგი','随机播放','Aleatorio'],
 ['Previous song','Предыдущий трек','წინა სიმღერა','上一首','Canción anterior'],
 ['Next song','Следующий трек','შემდეგი სიმღერა','下一首','Siguiente canción'],
 ['Repeat','Повтор','გამეორება','循环播放','Repetir'],
 ['Seek','Позиция воспроизведения','დაკვრის პოზიცია','播放进度','Posición'],
 ['Volume','Громкость','ხმის სიმაღლე','音量','Volumen'],
 ['Mute','Выключить звук','ხმის გამორთვა','静音','Silenciar'],
 ['Close','Закрыть','დახურვა','关闭','Cerrar'],
 ['Close upload','Закрыть загрузку','ატვირთვის დახურვა','关闭上传','Cerrar carga'],
 ['Close settings','Закрыть настройки','პარამეტრების დახურვა','关闭设置','Cerrar ajustes'],
 ['Close sign in','Закрыть вход','შესვლის დახურვა','关闭登录','Cerrar inicio de sesión'],
 ['Show password','Показать пароль','პაროლის ჩვენება','显示密码','Mostrar contraseña'],
 ['Hide password','Скрыть пароль','პაროლის დამალვა','隐藏密码','Ocultar contraseña'],
 ['Song removed from playlist.','Трек удалён из плейлиста.','სიმღერა ამოიშალა ფლეილისტიდან.','已从歌单移除歌曲。','Canción eliminada de la playlist.'],
 ['Playlist updated.','Плейлист обновлён.','ფლეილისტი განახლდა.','歌单已更新。','Playlist actualizada.'],
 ['Your playlist is ready.','Ваш плейлист готов.','შენი ფლეილისტი მზადაა.','你的歌单已准备好。','Tu playlist está lista.'],
 ['Playlist deleted.','Плейлист удалён.','ფლეილისტი წაიშალა.','歌单已删除。','Playlist eliminada.'],
 ['Your song is ready. Make yourself at home.','Трек готов. Приятного прослушивания.','შენი სიმღერა მზადაა. სასიამოვნო მოსმენას გისურვებთ.','歌曲已准备好，尽情享受吧。','Tu canción está lista. Siéntete como en casa.'],
 ['You are signed in. Welcome to Groove.','Вы вошли. Добро пожаловать в Groove.','შენ შეხვედი. კეთილი იყოს შენი მობრძანება Groove-ში.','登录成功，欢迎来到 Groove。','Has iniciado sesión. Bienvenido a Groove.'],
 ['You are signed out.','Вы вышли из аккаунта.','შენ გახვედი ანგარიშიდან.','你已退出登录。','Has cerrado sesión.'],
 ['Email or password is incorrect.','Неверная почта или пароль.','ელფოსტა ან პაროლი არასწორია.','邮箱或密码错误。','El correo o la contraseña son incorrectos.'],
 ['Enter a valid email address.','Введите корректный адрес почты.','შეიყვანე სწორი ელფოსტა.','请输入有效的邮箱地址。','Introduce un correo válido.'],
 ['Use a password with 8 to 128 characters.','Пароль должен содержать от 8 до 128 символов.','პაროლი უნდა შეიცავდეს 8-დან 128 სიმბოლომდე.','密码需包含 8 至 128 个字符。','Usa una contraseña de 8 a 128 caracteres.'],
 ['Enter your name.','Введите ваше имя.','შეიყვანე შენი სახელი.','请输入你的名字。','Introduce tu nombre.'],
 ['An account with this email already exists.','Аккаунт с этой почтой уже существует.','ამ ელფოსტით ანგარიში უკვე არსებობს.','此邮箱已注册。','Ya existe una cuenta con este correo.'],
 ['Too many attempts. Please try again later.','Слишком много попыток. Попробуйте позже.','ძალიან ბევრი მცდელობაა. სცადე მოგვიანებით.','尝试次数过多，请稍后再试。','Demasiados intentos. Inténtalo más tarde.'],
 ['Please choose an audio file.','Выберите аудиофайл.','აირჩიე აუდიოფაილი.','请选择音频文件。','Elige un archivo de audio.'],
 ['Please choose an image for your cover.','Выберите изображение для обложки.','აირჩიე სურათი გარეკანისთვის.','请选择封面图片。','Elige una imagen para la portada.'],
 ['Choose an audio file and enter a song name.','Выберите аудиофайл и введите название.','აირჩიე აუდიოფაილი და შეიყვანე სიმღერის სახელი.','请选择音频文件并输入歌曲名称。','Elige un archivo y escribe el nombre de la canción.'],
 ['Please choose a supported audio file.','Выберите поддерживаемый аудиофайл.','აირჩიე მხარდაჭერილი აუდიოფაილი.','请选择支持的音频文件。','Elige un archivo de audio compatible.'],
 ['Audio is unavailable. Try another song or upload your own.','Аудио недоступно. Выберите другой трек или загрузите свой.','აუდიო მიუწვდომელია. სცადე სხვა სიმღერა ან ატვირთე შენი.','音频不可用，请尝试其他歌曲或上传自己的音乐。','Audio no disponible. Prueba otra canción o sube la tuya.'],
 ['This track could not play. Please check your connection or audio file.','Не удалось воспроизвести трек. Проверьте подключение или файл.','სიმღერა ვერ ჩაირთო. შეამოწმე კავშირი ან აუდიოფაილი.','无法播放，请检查网络连接或音频文件。','No se pudo reproducir. Comprueba la conexión o el archivo.'],
 ['Could not save changes. Check browser storage.','Не удалось сохранить изменения. Проверьте хранилище браузера.','ცვლილებები ვერ შეინახა. შეამოწმე ბრაუზერის მეხსიერება.','无法保存更改，请检查浏览器存储。','No se guardaron los cambios. Comprueba el almacenamiento del navegador.'],
 ['Could not save the playlist. Check your browser storage and try again.','Не удалось сохранить плейлист. Проверьте хранилище браузера.','ფლეილისტი ვერ შეინახა. შეამოწმე ბრაუზერის მეხსიერება და სცადე ისევ.','无法保存歌单，请检查浏览器存储后重试。','No se pudo guardar la playlist. Comprueba el almacenamiento e inténtalo de nuevo.'],
 ['Could not sign out. Please try again.','Не удалось выйти. Попробуйте снова.','გასვლა ვერ მოხერხდა. სცადე ისევ.','无法退出，请重试。','No se pudo cerrar sesión. Inténtalo de nuevo.'],
 ['Could not save account changes. Please try again.','Не удалось сохранить данные аккаунта. Попробуйте снова.','ანგარიშის ცვლილებები ვერ შეინახა. სცადე ისევ.','无法保存账号更改，请重试。','No se guardaron los cambios de la cuenta. Inténtalo de nuevo.'],
 ['Language changed on this device. Could not update your account.','Язык изменён на устройстве. Не удалось обновить аккаунт.','ენა შეიცვალა მოწყობილობაზე. ანგარიში ვერ განახლდა.','已更改此设备的语言，但无法更新账号。','Idioma cambiado en este dispositivo. No se pudo actualizar la cuenta.'],
 ['Browser storage is unavailable. Enable site storage to save music.','Хранилище браузера недоступно. Разрешите хранение данных сайта.','ბრაუზერის მეხსიერება მიუწვდომელია. ჩართე საიტის მონაცემების შენახვა.','浏览器存储不可用，请启用网站存储。','Almacenamiento no disponible. Permite guardar datos del sitio.'],
 ['Could not save this song. Your browser storage may be full.','Не удалось сохранить трек. Возможно, хранилище заполнено.','სიმღერა ვერ შეინახა. ბრაუზერის მეხსიერება შესაძლოა სავსეა.','无法保存歌曲，浏览器存储可能已满。','No se guardó la canción. Puede que el almacenamiento esté lleno.'],
 ['Saving was interrupted. Please try again.','Сохранение прервано. Попробуйте снова.','შენახვა შეწყდა. სცადე ისევ.','保存中断，请重试。','Se interrumpió el guardado. Inténtalo de nuevo.'],
 ['Song saved, but could not add it to the playlist.','Трек сохранён, но не добавлен в плейлист.','სიმღერა შეინახა, მაგრამ ფლეილისტში ვერ დაემატა.','歌曲已保存，但无法添加到歌单。','Canción guardada, pero no se pudo añadir a la playlist.'],
 ];
 const extraLabels = ['Music finder','Sort by','Recommended','Most popular','Shortest first','Longest first','Title: A to Z','Title: Z to A','Playback','All songs','Full songs','Previews','Help me find a song','Popularity: Apple Music US chart. Length: full recording.','Full song length','Apple Music US chart','Full song','KEEP THE WHOLE SONG','Listen in full.','This catalogue provides official previews, not full recordings. Add your own audio file to play the complete song here, or open it in Apple Music.','Upload full audio','Open in Apple Music ↗','Find your next favorite.','Local catalogue helper','AI music assistant','Tell me an artist, a song title, or the mood you are after.','Local suggestions use catalogue matches and mood tags. AI is not connected.','Your messages are sent to the AI provider to suggest songs.','Late-night drive','Workout energy','Something for a late-night drive','Popular songs for a workout','Songs by The Weeknd','Describe the music you want','An artist, a mood, a song you half remember...','Find songs','Here are a few picks for that mood. Try one, or tell me an artist you like.','These songs match your request. Play a preview or save a favorite to your playlist.','I could not find a match in this catalogue. Try an artist name, song title, or a mood like chill or workout.','The AI connection is unavailable. Using local suggestions instead.','Download song','Download your original audio file','Add full audio to download this song','Language pack could not load. Please try again.','Unknown artist','Add songs','Like current song','Music player','Current album cover','Song cover preview','Featured artist album artwork','Album cover','Search songs','Could not delete playlist. Check browser storage.','Likes cannot be saved in this browser.','Something went wrong. Please try again.','Please sign in first.','Choose a supported language.','Invalid request.','Request not allowed.','Request is too large.'];
 const locales = (window.GROOVE_LANGUAGES || [['en'],['ru'],['ka'],['zh'],['es']]).map(l=>l[0]);
 const primaryLocales = ['en','ru','ka','zh','es'];
 const packs = {};
 const dictionary = new Map(rows.map(row => [row[0],row]));
 const templates = [
  [/^(\d+) songs? in your orbit$/, ['$1 songs in your orbit','$1 треков в вашей орбите','$1 სიმღერა შენს ორბიტაზე','你的音乐空间中有 $1 首歌曲','$1 canciones en tu órbita']],
  [/^Showing (\d+) of (\d+) songs$/, ['Showing $1 of $2 songs','Показано $1 из $2 треков','ნაჩვენებია $1 / $2 სიმღერა','显示 $2 首中的 $1 首','Mostrando $1 de $2 canciones']],
  [/^(\d+) songs? · Made by you$/, ['$1 songs · Made by you','$1 треков · Создано вами','$1 სიმღერა · შენ მიერ შექმნილი','$1 首歌曲 · 由你创建','$1 canciones · Hecho por ti']],
  [/^Explore (\d+) songs\. Find a favorite and make it part of your playlist\.$/, ['Explore $1 songs. Find a favorite and make it part of your playlist.','Откройте $1 треков. Найдите любимые и добавьте их в плейлист.','აღმოაჩინე $1 სიმღერა. იპოვე რჩეული და დაამატე ფლეილისტში.','探索 $1 首歌曲，找到最爱并加入歌单。','Explora $1 canciones. Encuentra tus favoritas y añádelas a tu playlist.']],
  [/^More from (.+)\. Find your next favorite\.$/, ['More from $1. Find your next favorite.','Больше музыки $1. Найдите новый любимый трек.','მეტი მუსიკა: $1. იპოვე ახალი რჩეული.','更多 $1 的音乐，找到你的下一首最爱。','Más de $1. Encuentra tu próximo favorito.']],
  [/^Added to (.+)\.$/, ['Added to $1.','Добавлено в $1.','დაემატა: $1.','已添加到 $1。','Añadida a $1.']],
  [/^Play (.+)$/, ['Play $1','Слушать $1','მოუსმინე: $1','播放 $1','Reproducir $1']],
  [/^Like (.+)$/, ['Like $1','Нравится: $1','მოწონება: $1','喜欢 $1','Me gusta $1']],
  [/^Unlike (.+)$/, ['Unlike $1','Убрать из любимых: $1','მოწონების გაუქმება: $1','取消喜欢 $1','Quitar de favoritos: $1']],
  [/^More songs by (.+)$/, ['More songs by $1','Больше треков: $1','მეტი სიმღერა: $1','更多 $1 的歌曲','Más canciones de $1']],
  [/^Add (.+) to a playlist$/, ['Add $1 to a playlist','Добавить $1 в плейлист','$1 — ფლეილისტში დამატება','将 $1 添加到歌单','Añadir $1 a una playlist']],
  [/^Remove (.+) from playlist$/, ['Remove $1 from playlist','Удалить $1 из плейлиста','$1 — ფლეილისტიდან ამოშლა','从歌单移除 $1','Quitar $1 de la playlist']],
  [/^Delete "(.+)"\? Your songs will stay available\.$/, ['Delete "$1"? Your songs will stay available.','Удалить «$1»? Ваши треки останутся доступны.','წავშალოთ „$1“? სიმღერები ხელმისაწვდომი დარჩება.','删除“$1”？歌曲仍然可用。','¿Eliminar "$1"? Tus canciones seguirán disponibles.']]
 ];
 let locale = 'en';
 try { const saved = localStorage.getItem('groove-language'); if(locales.includes(saved)) locale = saved; } catch {}
 function translate(source) {
  const index = primaryLocales.indexOf(locale); if(locale === 'en') return source;
  const trim = source.trim().replace(/\u00a0/g,' ');
  let result = dictionary.get(trim)?.[index] || packs[locale]?.[trim];
  if (!result && trim.endsWith('.')) { const basic = dictionary.get(trim.slice(0,-1))?.[index] || packs[locale]?.[trim.slice(0,-1)]; if(basic) result = basic+'.'; }
  if (!result) for (const [pattern,values] of templates) { if(pattern.test(trim)) { const template = values[index] || packs[locale]?.[values[0]]; if(template) result = trim.replace(pattern,template); break; } }
  if (!result) { const match = trim.match(/^([+\u25b6]\s+)(.+)$/); if(match) { const text = dictionary.get(match[2].trim())?.[index] || packs[locale]?.[match[2].trim()]; if(text) result = match[1]+text; } }
  return result ? source.slice(0,source.indexOf(source.trim())) + result + source.slice(source.trimEnd().length) : source;
 }
 const originals = new WeakMap(), attributeOriginals = new WeakMap();
 const excluded = 'script,style,[data-no-translate],.song-card h3,.song-artists,#player-title,#player-artist,.playlist-nav-item b,.playlist-choice>span,#adding-song';
 function apply() {
  document.documentElement.lang = locale;
  document.documentElement.dir = ['ar','he','fa','ur','ckb','dv','ps','sd','ug','yi'].includes(locale) ? 'rtl' : 'ltr';
  const walker = document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let node;
  while((node = walker.nextNode())) {
   if(!node.textContent.trim() || node.parentElement?.closest(excluded)) continue;
   const previous = originals.get(node); const source = previous && node.textContent === previous.translated ? previous.source : node.textContent;
   const translated = translate(source); originals.set(node,{source,translated}); if(node.textContent !== translated) node.textContent = translated;
  }
  document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>{
   if(el.closest('[data-no-translate]') || el.matches('.song-card h3,.playlist-nav-item')) return;
   const history = attributeOriginals.get(el) || {};
   for(const attribute of ['placeholder','aria-label','title']) { const value = el.getAttribute(attribute); if(!value) continue; const old = history[attribute]; const source = old && old.translated === value ? old.source : value; const translated = translate(source); history[attribute] = {source,translated}; if(value !== translated) el.setAttribute(attribute,translated); }
   attributeOriginals.set(el,history);
  });
 }
 let queued = false;
 const observer = new MutationObserver(()=>{ if(!queued) { queued = true; queueMicrotask(()=>{ queued = false; apply(); }); } });
 let languageRequest = 0;
 async function loadPack(value) { if(value === 'en' || packs[value])return;const response=await fetch(`/locales/${value}.json`);if(!response.ok)throw new Error('Language pack could not load. Please try again.');packs[value]=await response.json(); }
 window.I18n = {get locale(){return locale;},t:translate,async setLanguage(value){if(!locales.includes(value))return;const request=++languageRequest;try{await loadPack(value);}catch{if(!primaryLocales.includes(value)){if(window.toast)window.toast('Language pack could not load. Please try again.');return;}}if(request!==languageRequest)return;locale=value;try{localStorage.setItem('groove-language',value);}catch{}apply();},apply};
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});
 apply();
 loadPack(locale).then(apply).catch(()=>{});
})();
