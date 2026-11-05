// Zdania do ćwiczenia "Ułóż zdanie". Format: polski | angielski | kategoria
const SENTENCE_DATA = `
Jak długo uczysz się angielskiego? | How long have you been learning English? | general
Nigdy nie byłem w Australii. | I have never been to Australia. | general
Gdybym miał więcej czasu, nauczyłbym się hiszpańskiego. | If I had more time, I would learn Spanish. | general
Ona pracuje tu od dwóch lat. | She has worked here for two years. | general
Wczoraj obejrzałem świetny film. | I watched a great film yesterday. | general
Czy mógłbyś mówić trochę wolniej? | Could you speak a bit more slowly? | general
Nie jestem pewien, czy on przyjdzie. | I'm not sure if he will come. | general
To jest najlepsza restauracja w mieście. | This is the best restaurant in the city. | general
Przyzwyczaiłem się do wczesnego wstawania. | I got used to getting up early. | general
Powinieneś był mi powiedzieć wcześniej. | You should have told me earlier. | general
On musiał zapomnieć o spotkaniu. | He must have forgotten about the meeting. | general
Mieszkam tu, odkąd byłem dzieckiem. | I have lived here since I was a child. | general
Gdybym wiedział, pomógłbym ci. | If I had known, I would have helped you. | general
Wolę herbatę od kawy. | I prefer tea to coffee. | general
Nie mogę się doczekać weekendu. | I can't wait for the weekend. | general
Jak się dostać na dworzec? | How do I get to the station? | travel
Chciałbym zarezerwować pokój na dwie noce. | I would like to book a room for two nights. | travel
O której godzinie jest śniadanie? | What time is breakfast? | travel
Mój lot jest opóźniony o dwie godziny. | My flight is delayed by two hours. | travel
Czy śniadanie jest wliczone w cenę? | Is breakfast included in the price? | travel
Zgubiłem swój paszport. | I have lost my passport. | travel
Czy mogę zapłacić kartą? | Can I pay by card? | travel
Poproszę rachunek. | Could we have the bill, please? | travel
Gdzie jest najbliższy bankomat? | Where is the nearest cash machine? | travel
Jestem uczulony na orzechy. | I am allergic to nuts. | travel
Czy jest tu w pobliżu apteka? | Is there a pharmacy near here? | travel
Pociąg odjeżdża z peronu trzeciego. | The train leaves from platform three. | travel
Chciałbym wynająć samochód na tydzień. | I would like to rent a car for a week. | travel
Klucz do pokoju nie działa. | The key card doesn't work. | travel
Przepraszam za spóźnienie. | Sorry I'm late. | work
Prześlę ci raport do końca dnia. | I will send you the report by the end of the day. | work
Czy możemy przełożyć spotkanie na jutro? | Can we move the meeting to tomorrow? | work
Odezwę się do ciebie w przyszłym tygodniu. | I will get back to you next week. | work
Nie zgadzam się z tym pomysłem. | I don't agree with this idea. | work
Czy możesz to wyjaśnić jeszcze raz? | Could you explain that again? | work
Musimy dotrzymać terminu. | We have to meet the deadline. | work
W załączniku przesyłam ofertę. | Please find the proposal attached. | work
Kto odpowiada za ten projekt? | Who is in charge of this project? | work
Zajmę się tym od razu. | I will deal with it right away. | work
Czy wszyscy są na bieżąco? | Is everyone up to speed? | work
Dziękuję za szybką odpowiedź. | Thank you for your quick reply. | work
Mamy problem z siecią. | We have a problem with the network. | telecom
Awaria trwała trzy godziny. | The outage lasted three hours. | telecom
Szukamy przyczyny źródłowej problemu. | We are looking for the root cause of the problem. | telecom
Klient skarży się na zerwane połączenia. | The customer is complaining about dropped calls. | telecom
Aktualizacja zostanie wdrożona w oknie serwisowym. | The update will be deployed during the maintenance window. | telecom
Opóźnienie jest zbyt wysokie dla rozmów wideo. | The latency is too high for video calls. | telecom
Zasięg w tym budynku jest bardzo słaby. | The coverage in this building is very poor. | telecom
Musimy zwiększyć przepustowość sieci. | We need to increase the network capacity. | telecom
Otworzyłem zgłoszenie dla tego problemu. | I have opened a ticket for this issue. | telecom
Proszę eskalować to zgłoszenie do drugiej linii. | Please escalate this ticket to the second line. | telecom
Znaleźliśmy tymczasowe obejście. | We have found a temporary workaround. | telecom
Ruch w sieci podwaja się w godzinach szczytu. | Network traffic doubles during peak hours. | telecom
Przełączenie awaryjne zadziałało automatycznie. | The failover worked automatically. | telecom
Gwarantujemy dostępność na poziomie 99,9 procent. | We guarantee 99.9 percent uptime. | telecom
Nowa stacja bazowa zostanie uruchomiona w przyszłym miesiącu. | The new base station will go live next month. | telecom
Utrata pakietów wpływa na jakość połączeń. | Packet loss affects call quality. | telecom
`;
