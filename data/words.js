// Baza słówek. Format linii: angielski | polski | przykładowe zdanie
// Listy ułożone według częstości użycia (inspirowane otwartymi listami NGSL / NAWL / BSL),
// tłumaczenia i przykłady przygotowane dla polskiego użytkownika.
const WORD_PACKS = [
{ cat: 'general', level: 'A1', items: `
time | czas | I don't have much time today.
people | ludzie | There were a lot of people at the party.
way | droga, sposób | This is the best way to do it.
day | dzień | Have a nice day!
thing | rzecz | There's one more thing I want to tell you.
man | mężczyzna | The man at the desk can help you.
woman | kobieta | That woman is my manager.
child | dziecko | She has one child.
friend | przyjaciel, znajomy | He is my best friend.
family | rodzina | I spend weekends with my family.
house | dom (budynek) | They live in a big house.
home | dom (miejsce zamieszkania) | I usually work from home on Fridays.
work | praca; pracować | I start work at eight.
school | szkoła | My son goes to school by bus.
city | miasto | Kraków is a beautiful city.
country | kraj; wieś | Which country are you from?
water | woda | Can I have a glass of water?
food | jedzenie | The food here is great.
money | pieniądze | I don't have any money on me.
car | samochód | I left my car at home.
room | pokój | The meeting room is on the second floor.
door | drzwi | Please close the door.
morning | poranek, rano | I go running every morning.
evening | wieczór | What are you doing this evening?
night | noc | I didn't sleep well last night.
week | tydzień | See you next week.
year | rok | I moved here two years ago.
name | imię, nazwa | What's your name?
question | pytanie | Can I ask you a question?
answer | odpowiedź; odpowiadać | I don't know the answer.
big | duży | It's a big company.
small | mały | We live in a small flat.
good | dobry | That's a good idea.
bad | zły | The weather is bad today.
new | nowy | I bought a new phone.
old | stary | This laptop is very old.
easy | łatwy | The test was easy.
hard | trudny; ciężko | This exercise is hard.
happy | szczęśliwy, zadowolony | I'm happy to hear that.
tired | zmęczony | I'm too tired to cook.
hungry | głodny | Are you hungry?
cheap | tani | The tickets were really cheap.
expensive | drogi | London is very expensive.
go | iść, jechać | Let's go home.
come | przychodzić | Can you come here for a second?
eat | jeść | We usually eat at seven.
drink | pić; napój | Would you like something to drink?
sleep | spać | I need to sleep.
buy | kupować | I need to buy some milk.
pay | płacić | Can I pay by card?
open | otwierać; otwarty | The shop is open until ten.
close | zamykać | What time do you close?
help | pomagać; pomoc | Can you help me, please?
want | chcieć | I want to learn English.
need | potrzebować | I need more time.
know | wiedzieć, znać | I don't know him.
think | myśleć, sądzić | I think you're right.
speak | mówić (językiem) | Do you speak English?
understand | rozumieć | Sorry, I don't understand.
always | zawsze | She is always late.
never | nigdy | I never drink coffee at night.
often | często | How often do you travel?
sometimes | czasami | Sometimes I work late.
today | dzisiaj | What's the plan for today?
tomorrow | jutro | See you tomorrow.
yesterday | wczoraj | I called him yesterday.
` },
{ cat: 'general', level: 'A2', items: `
journey | podróż | The journey took six hours.
weather | pogoda | What's the weather like?
holiday | wakacje, urlop | We're going on holiday in July.
neighbour | sąsiad | Our neighbours are very friendly.
appointment | umówiona wizyta | I have a doctor's appointment at three.
advice | rada, porada | Can you give me some advice?
mistake | błąd | Everyone makes mistakes.
reason | powód | Is there any reason for the delay?
problem | problem | We have a small problem.
idea | pomysł | I have no idea.
choice | wybór | You have no choice.
price | cena | The price includes breakfast.
bill | rachunek | Could we have the bill, please?
change | zmiana; reszta; zmieniać | Keep the change.
experience | doświadczenie; przeżycie | It was an amazing experience.
future | przyszłość | Nobody knows the future.
health | zdrowie | Smoking is bad for your health.
meeting | spotkanie, zebranie | The meeting starts at nine.
message | wiadomość | I'll send you a message.
noise | hałas | What's that noise?
pain | ból | I have a pain in my back.
plan | plan; planować | What's the plan?
rule | zasada, reguła | You have to follow the rules.
skill | umiejętność | Communication is an important skill.
trip | wycieczka, wyjazd | How was your business trip?
afraid | przestraszony | I'm afraid I can't come.
angry | zły, zdenerwowany | Don't be angry with me.
busy | zajęty | I'm very busy this week.
careful | ostrożny | Be careful, the floor is wet.
dangerous | niebezpieczny | It's dangerous to drive so fast.
different | inny, różny | This one is different.
enough | wystarczająco | We don't have enough time.
important | ważny | This is very important.
interesting | ciekawy | That's an interesting question.
possible | możliwy | Is it possible to change the date?
ready | gotowy | Are you ready?
sure | pewny | Are you sure?
quiet | cichy | It's a quiet street.
borrow | pożyczać (od kogoś) | Can I borrow your pen?
lend | pożyczać (komuś) | Could you lend me some money?
arrive | przybywać | What time does the train arrive?
book | rezerwować; książka | I booked a table for two.
choose | wybierać | It's hard to choose.
decide | decydować | Have you decided yet?
explain | wyjaśniać | Can you explain that again?
forget | zapominać | Don't forget your keys.
remember | pamiętać | I don't remember his name.
lose | gubić, przegrywać | I lost my wallet.
miss | tęsknić; spóźnić się na; przegapić | I missed the bus.
spend | wydawać (pieniądze); spędzać (czas) | I spend too much money on food.
try | próbować | Try again.
wait | czekać | Wait for me!
worry | martwić się | Don't worry about it.
already | już | I've already finished.
yet | jeszcze; już (w pytaniach) | Have you eaten yet?
still | wciąż, nadal | I'm still waiting.
probably | prawdopodobnie | It will probably rain.
almost | prawie | I'm almost ready.
` },
{ cat: 'general', level: 'B1', items: `
opportunity | okazja, szansa | It's a great opportunity to learn.
achievement | osiągnięcie | Finishing the project was a big achievement.
attitude | nastawienie, postawa | She has a positive attitude.
behaviour | zachowanie | His behaviour was unacceptable.
challenge | wyzwanie | Learning a language is a challenge.
condition | warunek; stan | The car is in good condition.
effort | wysiłek | It takes a lot of effort.
environment | środowisko | We work in a friendly environment.
evidence | dowód, dowody | There is no evidence.
feature | cecha, funkcja | This phone has some great features.
knowledge | wiedza | He has a good knowledge of networks.
quality | jakość | The quality is excellent.
purpose | cel | What's the purpose of this meeting?
range | zakres, gama | We offer a wide range of services.
relationship | związek, relacja | We have a good relationship with our clients.
result | wynik, rezultat | The results were better than expected.
solution | rozwiązanie | We need to find a solution.
success | sukces | The launch was a huge success.
average | przeciętny, średni; średnia | The average price is twenty euros.
available | dostępny | Is this room available tomorrow?
common | powszechny, częsty | It's a common mistake.
confident | pewny siebie | I feel more confident now.
disappointed | rozczarowany | I was disappointed with the results.
embarrassed | zawstydzony | I was so embarrassed.
familiar | znajomy, znany | This place looks familiar.
likely | prawdopodobny | It's likely to rain later.
obvious | oczywisty | The answer is obvious.
patient | cierpliwy; pacjent | Please be patient.
reliable | niezawodny, rzetelny | We need a reliable supplier.
suitable | odpowiedni | This hotel is suitable for families.
afford | pozwolić sobie (finansowo) | I can't afford a new car.
apply | składać podanie; stosować | I applied for a new job.
avoid | unikać | Try to avoid the city centre at rush hour.
complain | narzekać, reklamować | He always complains about something.
consider | rozważać | Have you considered moving abroad?
deal with | radzić sobie z, zajmować się | I'll deal with it tomorrow.
expect | oczekiwać, spodziewać się | I didn't expect that.
improve | poprawiać, ulepszać | I want to improve my English.
include | zawierać, obejmować | Does the price include tax?
manage | zarządzać; dać radę | Did you manage to fix it?
mention | wspominać | He didn't mention the price.
offer | oferować; oferta | They offered me a job.
prefer | woleć | I prefer tea to coffee.
prevent | zapobiegać | How can we prevent this?
provide | dostarczać, zapewniać | We provide technical support.
realise | uświadamiać sobie | I didn't realise it was so late.
recommend | polecać | Can you recommend a good restaurant?
refuse | odmawiać | She refused to answer.
suggest | sugerować, proponować | I suggest we take a break.
suppose | przypuszczać | I suppose you're right.
although | chociaż | Although it was late, we kept working.
however | jednak | However, there is one problem.
therefore | dlatego, zatem | Therefore, we need more time.
instead | zamiast tego | Let's walk instead.
unless | chyba że, jeśli nie | We'll go unless it rains.
eventually | ostatecznie, w końcu | Eventually, we found the hotel.
actually | właściwie, tak naprawdę | Actually, I've changed my mind.
especially | szczególnie | I love Italy, especially the food.
recently | ostatnio | Have you been busy recently?
` },
{ cat: 'general', level: 'B2', items: `
approach | podejście; zbliżać się | We need a different approach.
assumption | założenie | That's a reasonable assumption.
awareness | świadomość | We need to raise awareness of the issue.
consequence | konsekwencja | Every decision has consequences.
drawback | wada, minus | The main drawback is the price.
outcome | wynik, rezultat | We're happy with the outcome.
issue | kwestia, problem | That's a serious issue.
concern | obawa; dotyczyć | My main concern is the deadline.
priority | priorytet | Safety is our top priority.
requirement | wymóg | What are the requirements for this role?
trend | trend, tendencja | It's a growing trend.
benefit | korzyść; korzystać | What are the benefits of this plan?
circumstances | okoliczności | Under the circumstances, it was the best option.
perspective | perspektywa, punkt widzenia | Try to see it from my perspective.
accurate | dokładny | The data must be accurate.
aware | świadomy | Are you aware of the risks?
crucial | kluczowy | This is a crucial moment for the company.
efficient | wydajny | The new system is more efficient.
essential | niezbędny | Good communication is essential.
flexible | elastyczny | I have flexible working hours.
reluctant | niechętny | He was reluctant to help.
significant | znaczący | There was a significant increase in sales.
straightforward | prosty, bezproblemowy | The process is quite straightforward.
sufficient | wystarczający | We don't have sufficient data.
temporary | tymczasowy | It's only a temporary solution.
ultimately | ostatecznie | Ultimately, it's your decision.
whereas | podczas gdy | I like tea, whereas my wife prefers coffee.
despite | pomimo | Despite the rain, we went out.
moreover | ponadto | Moreover, the price is too high.
nevertheless | mimo to | It was difficult; nevertheless, we finished on time.
achieve | osiągać | We achieved our goals.
acknowledge | przyznawać, potwierdzać | Please acknowledge receipt of this email.
adjust | dostosować, regulować | You can adjust the settings.
assess | oceniać | We need to assess the risk.
claim | twierdzić; roszczenie | He claims he didn't know.
contribute | przyczyniać się, wnosić wkład | Everyone contributed to the project.
convince | przekonywać | You've convinced me.
emphasise | podkreślać | I want to emphasise this point.
ensure | zapewniać, upewniać się | Please ensure the door is locked.
estimate | szacować; szacunek | We estimate it will take two weeks.
focus on | skupiać się na | Let's focus on the main problem.
handle | radzić sobie z, obsługiwać | Can the system handle more users?
imply | sugerować, implikować | Are you implying that I'm wrong?
maintain | utrzymywać, konserwować | We need to maintain high standards.
obtain | uzyskać | You need to obtain permission first.
overcome | pokonać, przezwyciężyć | We overcame many difficulties.
postpone | przełożyć (na później) | The meeting has been postponed.
reduce | zmniejszać | We need to reduce costs.
rely on | polegać na | You can rely on me.
require | wymagać | This job requires experience.
` },
{ cat: 'general', level: 'C1', items: `
ambiguous | dwuznaczny, niejasny | The instructions were ambiguous.
comprehensive | wszechstronny, kompleksowy | We need a comprehensive review.
compelling | przekonujący | She made a compelling argument.
feasible | wykonalny | Is this plan feasible?
inevitable | nieunikniony | Some delays are inevitable.
meticulous | drobiazgowy, skrupulatny | He's meticulous about details.
viable | realny, opłacalny | It's not a viable option.
substantial | znaczny | We made substantial progress.
tentative | wstępny, niepewny | We have a tentative agreement.
thorough | gruntowny, dokładny | We did a thorough check.
prone to | skłonny do, podatny na | This area is prone to flooding.
pitfall | pułapka, ukryte ryzyko | Here are some common pitfalls to avoid.
leverage | wykorzystywać; przewaga | We can leverage our experience.
mitigate | łagodzić, ograniczać | We need to mitigate the risks.
undermine | podważać | This could undermine trust.
streamline | usprawniać | We want to streamline the process.
foster | wspierać, rozwijać | We try to foster a culture of learning.
discrepancy | rozbieżność | There's a discrepancy in the figures.
nuance | niuans | He understands the nuances of the language.
scrutiny | wnikliwa analiza, kontrola | The proposal is under scrutiny.
endeavour | przedsięwzięcie; usiłować | We wish you success in your future endeavours.
hindsight | perspektywa czasu | In hindsight, it was a mistake.
consensus | zgoda, konsensus | We reached a consensus.
deteriorate | pogarszać się | The situation has deteriorated.
elaborate | rozwinąć (myśl); szczegółowy | Could you elaborate on that?
anticipate | przewidywać | We anticipate some problems.
arguably | prawdopodobnie, można by twierdzić | It's arguably the best solution.
notwithstanding | pomimo | Notwithstanding the costs, we'll go ahead.
albeit | aczkolwiek, choć | It worked, albeit slowly.
whereby | przez co, na mocy którego | A system whereby users pay monthly.
` },
{ cat: 'phrasal', level: 'B1', items: `
carry out | przeprowadzać, wykonywać | We carried out a test.
set up | zakładać, konfigurować | Can you set up the new router?
find out | dowiedzieć się | I need to find out what happened.
figure out | rozgryźć, wymyślić | I can't figure out how it works.
look into | zbadać, przyjrzeć się | We'll look into the problem.
come up with | wymyślić | She came up with a great idea.
put off | odkładać na później | Don't put it off until tomorrow.
call off | odwołać | They called off the meeting.
bring up | poruszyć (temat) | Don't bring up politics.
turn down | odrzucić; ściszyć | He turned down the offer.
run out of | skończyć się (zapas) | We've run out of coffee.
get along with | dogadywać się z | I get along well with my boss.
look forward to | nie móc się doczekać | I look forward to hearing from you.
give up | poddać się, rzucić | Don't give up!
catch up | nadrobić; dogonić | Let's catch up next week.
sort out | załatwić, uporządkować | I'll sort it out.
point out | zwrócić uwagę na | He pointed out a mistake.
back up | robić kopię zapasową; popierać | Always back up your files.
roll out | wdrażać, wprowadzać (na rynek) | We're rolling out the update next month.
shut down | wyłączać, zamykać | The server shut down unexpectedly.
break down | zepsuć się; rozłożyć na części | My car broke down on the motorway.
take over | przejąć | Can you take over while I'm away?
fill in | wypełnić; zastąpić | Please fill in this form.
go through | przejrzeć; przejść przez | Let's go through the report.
keep up with | nadążać za | It's hard to keep up with new technology.
deal with | radzić sobie z | I'll deal with the client.
follow up | podjąć dalsze działania | I'll follow up with an email.
get back to | odezwać się (z odpowiedzią) | I'll get back to you tomorrow.
hold on | poczekać (chwilę) | Hold on, I'll check.
work out | rozwiązać; ćwiczyć; udać się | Everything worked out in the end.
` },
{ cat: 'colloc', level: 'B2', items: `
make a decision | podjąć decyzję | We need to make a decision today.
take a break | zrobić przerwę | Let's take a ten-minute break.
pay attention | zwracać uwagę | Please pay attention to the details.
make progress | robić postępy | You're making great progress.
do business | prowadzić interesy | We do business with many countries.
meet a deadline | zmieścić się w terminie | We have to meet the deadline.
raise a question | poruszyć kwestię | This raises an important question.
take responsibility | wziąć odpowiedzialność | I take full responsibility.
reach an agreement | osiągnąć porozumienie | We finally reached an agreement.
save time | oszczędzać czas | This tool saves a lot of time.
on the same page | zgodni, na tej samej stronie | Let's make sure we're on the same page.
a piece of cake | bułka z masłem | The exam was a piece of cake.
break the ice | przełamać lody | He told a joke to break the ice.
get the hang of | załapać, nabrać wprawy | You'll get the hang of it.
in the long run | na dłuższą metę | It will save money in the long run.
keep in touch | być w kontakcie | Let's keep in touch.
the bottom line | sedno sprawy; wynik finansowy | The bottom line is we need more people.
under the weather | nie w formie, chory | I'm feeling a bit under the weather.
up to speed | na bieżąco | Can you bring me up to speed?
hit the ground running | ruszyć z kopyta | The new team hit the ground running.
cut corners | iść na skróty, oszczędzać na jakości | We can't cut corners on safety.
by the way | przy okazji | By the way, did you call him?
it's up to you | to zależy od ciebie | It's up to you.
as far as I know | o ile wiem | As far as I know, he's on holiday.
it's not a big deal | to nic wielkiego | Don't worry, it's not a big deal.
` },
{ cat: 'work', level: 'B1', items: `
colleague | kolega z pracy | My colleagues are very helpful.
manager | kierownik | I need to talk to my manager.
team | zespół | Our team has five people.
customer | klient | The customer is always right.
client | klient (biznesowy) | We're meeting a new client today.
supplier | dostawca | We changed our supplier.
salary | pensja | The salary is paid monthly.
deadline | termin | The deadline is Friday.
task | zadanie | I have a lot of tasks today.
schedule | harmonogram; zaplanować | Let's schedule a call.
agenda | porządek spotkania | What's on the agenda?
report | raport; zgłaszać | I'm writing a report.
budget | budżet | We're over budget.
contract | umowa, kontrakt | We signed the contract.
invoice | faktura | Please send me the invoice.
department | dział | Which department do you work in?
headquarters | siedziba główna | Our headquarters are in Warsaw.
experience | doświadczenie | Do you have any experience in sales?
interview | rozmowa kwalifikacyjna; wywiad | I have a job interview tomorrow.
promotion | awans; promocja | She got a promotion.
resign | rezygnować (z pracy) | He resigned last month.
hire | zatrudniać | We're hiring new engineers.
attend | uczestniczyć | Will you attend the meeting?
negotiate | negocjować | We need to negotiate the price.
feedback | informacja zwrotna | Thanks for your feedback.
proposal | propozycja, oferta | We sent them a proposal.
stakeholder | interesariusz | We need to inform all stakeholders.
workload | obciążenie pracą | My workload is too high.
remote work | praca zdalna | Remote work is very popular now.
shift | zmiana (w pracy) | I'm on the night shift.
attachment | załącznik | Please find the attachment below.
reminder | przypomnienie | Just a quick reminder about tomorrow.
to be in charge of | odpowiadać za, kierować | Who's in charge of this project?
on behalf of | w imieniu | I'm writing on behalf of my company.
as soon as possible | jak najszybciej | Please reply as soon as possible.
` },
{ cat: 'telecom', level: 'B2', items: `
network | sieć | The network is down.
coverage | zasięg | We have good coverage in the city.
latency | opóźnienie (latencja) | 5G offers very low latency.
bandwidth | szerokość pasma, przepustowość | We need more bandwidth.
throughput | przepustowość (rzeczywista) | The throughput dropped during peak hours.
outage | awaria, przerwa w działaniu | There was a network outage last night.
base station | stacja bazowa | We installed a new base station.
mast | maszt | The mast is fifty metres high.
backhaul | sieć dosyłowa (backhaul) | Microwave backhaul is cheaper to deploy.
fibre optic | światłowodowy | We use fibre optic cables.
core network | sieć szkieletowa, rdzeń sieci | The core network handles all traffic.
access network | sieć dostępowa | We're upgrading the access network.
node | węzeł | The traffic passes through several nodes.
handover | przełączenie między komórkami | The handover failed and the call dropped.
dropped call | zerwane połączenie | Customers complain about dropped calls.
signal strength | siła sygnału | The signal strength is very weak here.
interference | zakłócenia | The interference comes from another antenna.
attenuation | tłumienie | Attenuation increases with distance.
packet loss | utrata pakietów | High packet loss affects video calls.
jitter | jitter, zmienność opóźnienia | Jitter is a problem for VoIP.
spectrum | widmo częstotliwości | The operator bought new spectrum.
frequency band | pasmo częstotliwości | This phone supports all frequency bands.
subscriber | abonent | We have two million subscribers.
carrier | operator | Which carrier are you with?
roaming | roaming | Roaming charges are high outside the EU.
capacity | pojemność, przepustowość | We need to increase network capacity.
congestion | przeciążenie | Congestion happens during big events.
redundancy | nadmiarowość, redundancja | We have redundancy in the core.
failover | przełączenie awaryjne | The failover worked automatically.
uptime | czas dostępności | We guarantee 99.9% uptime.
downtime | czas niedostępności | Planned downtime is on Sunday night.
service level agreement | umowa SLA | The SLA requires a four-hour fix.
maintenance window | okno serwisowe | The upgrade is scheduled for the maintenance window.
troubleshoot | diagnozować i usuwać usterki | I spent all day troubleshooting the link.
escalate | eskalować | Please escalate this ticket to level two.
ticket | zgłoszenie | I've opened a ticket for this issue.
deploy | wdrażać | We deployed the new software yesterday.
deployment | wdrożenie | The deployment went smoothly.
upgrade | modernizacja; modernizować | The network upgrade will take two months.
provision | udostępnić, uruchomić (usługę) | We'll provision the line by Monday.
leased line | łącze dzierżawione | The client needs a leased line.
last mile | ostatnia mila | The last mile is the most expensive part.
firewall | zapora sieciowa | The firewall blocked the traffic.
encryption | szyfrowanie | All data is protected by encryption.
vendor | dostawca (sprzętu, oprogramowania) | We use equipment from several vendors.
churn | odpływ klientów | Churn increased after the price rise.
regulator | regulator, urząd regulacyjny | The regulator approved the merger.
compliance | zgodność z przepisami | We must ensure compliance with GDPR.
peak hours | godziny szczytu | Traffic doubles during peak hours.
outage report | raport z awarii | Please send the outage report to the client.
root cause | przyczyna źródłowa | We're still looking for the root cause.
workaround | obejście, rozwiązanie tymczasowe | We found a workaround for now.
` },
{ cat: 'travel', level: 'A2', items: `
airport | lotnisko | How do I get to the airport?
flight | lot | My flight is delayed.
boarding pass | karta pokładowa | Please show your boarding pass.
gate | wyjście (na lotnisku) | The flight leaves from gate twelve.
departure | odlot, odjazd | Check the departure board.
arrival | przylot, przyjazd | The arrival time is 10:30.
delay | opóźnienie | Sorry for the delay.
luggage | bagaż | I can't find my luggage.
hand luggage | bagaż podręczny | You can take one piece of hand luggage.
check in | zameldować się; odprawić się | What time can we check in?
check out | wymeldować się | We have to check out by eleven.
reservation | rezerwacja | I have a reservation under the name Nowak.
single room | pokój jednoosobowy | I'd like a single room, please.
double room | pokój dwuosobowy | Is there a double room available?
reception | recepcja | Ask at reception.
key card | karta do pokoju | My key card doesn't work.
passport | paszport | Don't forget your passport.
ticket | bilet | Two tickets to Edinburgh, please.
return ticket | bilet powrotny | A return ticket is cheaper.
platform | peron | The train leaves from platform three.
timetable | rozkład jazdy | Where can I see the timetable?
fare | opłata za przejazd | How much is the fare?
sightseeing | zwiedzanie | We went sightseeing in Rome.
guided tour | wycieczka z przewodnikiem | Is there a guided tour in English?
currency | waluta | What currency do they use?
exchange rate | kurs wymiany | What's the exchange rate today?
cash machine | bankomat | Is there a cash machine nearby?
receipt | paragon | Can I have a receipt, please?
refund | zwrot pieniędzy | I'd like a refund.
directions | wskazówki (dojazdu) | Can you give me directions to the station?
straight ahead | prosto przed siebie | Go straight ahead and turn left.
crossroads | skrzyżowanie | Turn right at the crossroads.
nearby | w pobliżu | Is there a pharmacy nearby?
rent a car | wynająć samochód | We want to rent a car for three days.
insurance | ubezpieczenie | Is insurance included?
menu | menu, karta dań | Could we see the menu, please?
order | zamawiać; zamówienie | Are you ready to order?
tip | napiwek | Is the tip included?
allergic to | uczulony na | I'm allergic to nuts.
lost property | biuro rzeczy znalezionych | Where is the lost property office?
emergency | nagły wypadek | In an emergency, call 112.
` },
{ cat: 'telecom', level: 'B2', items: `
antenna | antena | The antenna was damaged in the storm.
transceiver | nadajnik-odbiornik | We need to replace the faulty transceiver.
microwave link | łącze radiowe (mikrofalowe) | The site is connected by a microwave link.
gateway | brama sieciowa | All traffic goes through the gateway.
IP address | adres IP | The device didn't get an IP address.
subnet | podsieć | Each office has its own subnet.
routing | trasowanie (routing) | There's a problem with the routing.
routing table | tablica routingu | Check the routing table on the core router.
protocol | protokół | Which protocol does the device use?
packet | pakiet | Some packets are being dropped.
traffic | ruch (sieciowy) | Traffic is much higher in the evening.
load balancing | równoważenie obciążenia | Load balancing spreads traffic across servers.
quality of service | jakość usług (QoS) | Quality of service is critical for voice calls.
signal-to-noise ratio | stosunek sygnału do szumu | The signal-to-noise ratio is too low.
modulation | modulacja | Higher modulation gives more throughput.
frequency | częstotliwość | The radio works on a different frequency.
wavelength | długość fali | Each channel uses a different wavelength.
splice | spaw (światłowodu); spawać | The technician spliced the broken fibre.
splitter | rozgałęźnik (splitter) | One splitter serves thirty-two homes.
duct | kanalizacja kablowa | The cable runs through an underground duct.
cabinet | szafa (telekomunikacyjna) | The street cabinet was flooded.
rack | szafa rack, stelaż | Install the switch in the second rack.
patch panel | panel krosowy | Label every port on the patch panel.
patch cord | kabel krosowy (patchcord) | Replace the patch cord and test again.
link budget | bilans łącza | The link budget is too tight for this distance.
fault | usterka, awaria | The fault was on the customer's side.
alarm | alarm | We received a critical alarm from the site.
monitoring | monitoring, nadzór | Our monitoring system detected the outage.
network operations centre | centrum zarządzania siecią (NOC) | Call the network operations centre.
field engineer | technik terenowy | A field engineer will visit the site tomorrow.
site survey | wizja lokalna | We need a site survey before installation.
installation | instalacja, montaż | The installation took two days.
commissioning | uruchomienie, oddanie do eksploatacji | Commissioning is planned for next week.
acceptance test | test odbiorczy | The client signed the acceptance test.
SIM card | karta SIM | Insert the SIM card and restart the phone.
prepaid | na kartę (prepaid) | Prepaid customers can top up online.
postpaid | abonamentowy | Most business clients are postpaid.
tariff | taryfa, cennik | The new tariff includes unlimited data.
data plan | pakiet danych | My data plan has 50 gigabytes.
top-up | doładowanie | You can buy a top-up at any shop.
number portability | przeniesienie numeru | Number portability takes one working day.
call centre | infolinia, call center | The call centre is open 24/7.
voicemail | poczta głosowa | Leave a message on my voicemail.
broadband | internet szerokopasmowy | Broadband is now available in rural areas.
landline | telefon stacjonarny | Fewer people use a landline today.
mobile operator | operator komórkowy | There are four mobile operators in Poland.
small cell | mała komórka (small cell) | Small cells improve coverage indoors.
uplink | łącze w górę (uplink) | The uplink speed is much lower.
downlink | łącze w dół (downlink) | Downlink speeds reached one gigabit.
tilt | pochylenie (anteny) | We changed the antenna tilt to reduce interference.
azimuth | azymut | Check the azimuth of each sector.
` },
{ cat: 'tech', level: 'B1', items: `
server | serwer | The server is down again.
database | baza danych | All customer data is stored in the database.
software | oprogramowanie | We need to update the software.
hardware | sprzęt | The problem is with the hardware, not the software.
device | urządzenie | Restart the device and try again.
interface | interfejs | The new interface is much easier to use.
configure | konfigurować | Can you configure the router for me?
configuration | konfiguracja | Save the configuration before you reboot.
settings | ustawienia | Open the settings and change the password.
install | instalować | I installed the latest version.
uninstall | odinstalować | Uninstall the old app first.
release | wydanie (wersji); wypuszczać | The next release is due in March.
version | wersja | Which version are you using?
bug | błąd (w programie) | We found a bug in the billing system.
fix | naprawiać; poprawka | The fix will be ready tomorrow.
patch | łatka (poprawka) | Install the security patch as soon as possible.
crash | awaria, zawieszenie; zawiesić się | The application crashed during the demo.
freeze | zawieszać się | My laptop keeps freezing.
reboot | uruchomić ponownie | Reboot the server after the update.
error message | komunikat o błędzie | What does the error message say?
log file | plik logów | Send me the log file, please.
power supply | zasilacz, zasilanie | The power supply failed.
battery | bateria, akumulator | The battery lasts all day.
charger | ładowarka | I forgot my phone charger.
cable | kabel | Is the cable plugged in?
plug in | podłączyć | Plug in the cable and wait a minute.
socket | gniazdko | There's no free socket in this room.
wireless | bezprzewodowy | The office has a wireless network.
access point | punkt dostępowy | We installed a new access point on each floor.
username | nazwa użytkownika | Enter your username and password.
credentials | dane logowania | Never share your credentials.
log in | zalogować się | I can't log in to the system.
permission | uprawnienie, pozwolenie | You don't have permission to edit this file.
backup | kopia zapasowa | We make a backup every night.
restore | przywracać | We restored the data from the backup.
storage | pamięć, przechowywanie danych | We're running out of storage.
download | pobierać | Download the file from the shared folder.
upload | wysyłać (na serwer) | Upload your report to the portal.
data | dane | The data is updated every hour.
spreadsheet | arkusz kalkulacyjny | I put all the numbers in a spreadsheet.
dashboard | pulpit, panel | The dashboard shows network status in real time.
script | skrypt | I wrote a script to automate the report.
automate | automatyzować | We want to automate this process.
workflow | przepływ pracy, proces | The new workflow saves us a lot of time.
integration | integracja | The integration with the CRM is almost done.
specification | specyfikacja | Read the technical specification first.
documentation | dokumentacja | The documentation is out of date.
user manual | instrukcja obsługi | It's explained in the user manual.
prototype | prototyp | We built a prototype in two weeks.
pilot project | projekt pilotażowy | The pilot project starts in May.
scalable | skalowalny | We need a scalable solution.
performance | wydajność | The performance improved after the upgrade.
bottleneck | wąskie gardło | The database is the main bottleneck.
maintenance | konserwacja, utrzymanie | The system is down for maintenance.
spare part | część zamienna | We keep spare parts in the warehouse.
warranty | gwarancja | The device is still under warranty.
tender | przetarg | We won the tender for the new network.
procurement | zakupy, zaopatrzenie | Procurement must approve the order.
milestone | kamień milowy | We reached the first milestone on time.
deliverable | produkt (rezultat projektu) | What are the deliverables for this phase?
scope | zakres | That's outside the scope of the project.
kick-off meeting | spotkanie otwierające projekt | The kick-off meeting is on Monday.
status update | informacja o postępach | Can you send me a quick status update?
requirement | wymaganie | The client changed the requirements again.
cybersecurity | cyberbezpieczeństwo | Cybersecurity is a top priority.
vulnerability | podatność (luka bezpieczeństwa) | They found a vulnerability in the firmware.
firmware | oprogramowanie układowe (firmware) | Update the firmware on all routers.
artificial intelligence | sztuczna inteligencja | We use artificial intelligence to predict faults.
` },
{ cat: 'academic', level: 'C1', items: `
allocate | przydzielać, alokować | We need to allocate more resources to the project.
coherent | spójny, logiczny | She presented a clear and coherent plan.
comprise | składać się z, obejmować | The team comprises five engineers and a manager.
constitute | stanowić | Women constitute half of our workforce.
derive | wywodzić, czerpać | Many English words are derived from Latin.
diminish | zmniejszać się, słabnąć | The risk has diminished since the upgrade.
disclose | ujawniać | The company refused to disclose the details.
explicit | wyraźny, jednoznaczny | The contract is explicit about the deadlines.
implicit | domniemany, ukryty | There was an implicit agreement between them.
facilitate | ułatwiać | The new tool facilitates communication between teams.
fluctuate | wahać się (o cenach, wartościach) | Prices fluctuate depending on demand.
incentive | zachęta, bodziec | We offer bonuses as an incentive.
inherent | nieodłączny, wrodzony | There are risks inherent in any new technology.
initiative | inicjatywa | She took the initiative and called the client.
integrity | uczciwość, spójność | Data integrity is our top priority.
mandate | mandat, upoważnienie; zlecać | The board gave him a mandate to cut costs.
negligible | znikomy | The difference in price is negligible.
notion | pojęcie, wyobrażenie | I have no notion of what he meant.
perceive | postrzegać | How do customers perceive our brand?
pertinent | trafny, istotny | She asked some very pertinent questions.
plausible | wiarygodny, prawdopodobny | That's a plausible explanation.
prerequisite | warunek wstępny | Experience is a prerequisite for this role.
prospective | przyszły, potencjalny | We met several prospective clients.
rationale | uzasadnienie | Can you explain the rationale behind this decision?
reconcile | godzić, uzgadniać | It's hard to reconcile work and family life.
robust | solidny, odporny | We need a robust network that never fails.
scrutinise | dokładnie badać | The auditors scrutinised every invoice.
subsequent | późniejszy, następny | Subsequent tests confirmed the problem.
sustainable | zrównoważony | We are looking for sustainable solutions.
tangible | namacalny, konkretny | The project brought tangible results.
undertake | podejmować się | We undertook a complete review of the system.
utilise | wykorzystywać | We fully utilise the available bandwidth.
accountability | odpowiedzialność (rozliczalność) | There must be accountability for these mistakes.
benchmark | punkt odniesienia; porównywać | Our results set a new benchmark for the industry.
contingency | ewentualność; plan awaryjny | We have a contingency plan in case of failure.
cost-effective | opłacalny | Fibre is a cost-effective long-term solution.
due diligence | należyta staranność, badanie due diligence | We carried out due diligence before the acquisition.
expenditure | wydatki | Capital expenditure increased by ten percent.
headcount | liczba pracowników (etatów) | The company plans to reduce its headcount.
outsource | zlecać na zewnątrz | We outsource our customer support.
overhead | koszty ogólne; nad głową | We need to reduce our overheads.
roadmap | plan działania, mapa drogowa | Here is the product roadmap for next year.
scalability | skalowalność | Scalability is crucial for cloud services.
shareholder | akcjonariusz, udziałowiec | The shareholders approved the merger.
turnover | obrót; rotacja pracowników | Staff turnover is very high in call centres.
underperform | osiągać słabe wyniki | The new product underperformed in the first quarter.
workforce | siła robocza, pracownicy | Half of our workforce works remotely.
to some extent | w pewnym stopniu | I agree with you to some extent.
on the other hand | z drugiej strony | It's expensive. On the other hand, it's very reliable.
in terms of | pod względem | In terms of speed, 5G is much better.
with regard to | w odniesieniu do, w sprawie | I'm writing with regard to your last invoice.
as a result | w rezultacie | The cable was cut. As a result, thousands lost internet.
in the long term | w dłuższej perspektywie | In the long term, this will save us money.
take into account | brać pod uwagę | We must take into account the cost of maintenance.
bear in mind | mieć na uwadze, pamiętać | Bear in mind that the office closes at five.
put forward | przedstawić (propozycję) | She put forward an interesting proposal.
draw a conclusion | wyciągnąć wniosek | It's too early to draw a conclusion.
raise concerns | wyrażać obawy | The clients raised concerns about security.
address an issue | zająć się problemem | We need to address this issue immediately.
meet expectations | spełniać oczekiwania | The results did not meet our expectations.
a wide range of | szeroki wybór, szeroki zakres | We offer a wide range of services.
play a key role | odgrywać kluczową rolę | Fibre plays a key role in our strategy.
come to terms with | pogodzić się z | He came to terms with the decision.
far-reaching | dalekosiężny, daleko idący | The changes will have far-reaching consequences.
counterintuitive | sprzeczny z intuicją | The results were counterintuitive.
overwhelming | przytłaczający, ogromny | The response was overwhelming.
detrimental | szkodliwy | Stress is detrimental to your health.
beneficial | korzystny | The new policy is beneficial for everyone.
prevalent | powszechny, rozpowszechniony | This problem is prevalent in rural areas.
conducive | sprzyjający | A quiet office is conducive to concentration.
susceptible | podatny | Older devices are susceptible to attacks.
contentious | sporny, kontrowersyjny | Pricing is a contentious issue.
elusive | nieuchwytny, trudny do osiągnięcia | A solution remains elusive.
intricate | zawiły, skomplikowany | The system has an intricate design.
proficient | biegły | She is proficient in three languages.
resilient | odporny, prężny | We are building a more resilient network.
versatile | wszechstronny | It's a versatile tool for many tasks.
adverse | niekorzystny | The storm had an adverse effect on the network.
arbitrary | arbitralny, przypadkowy | The decision seemed completely arbitrary.
concise | zwięzły | Please keep your report concise.
deem | uważać za | The plan was deemed too risky.
entail | pociągać za sobą, wiązać się z | The job entails a lot of travelling.
exacerbate | pogarszać, zaostrzać | The delay exacerbated the problem.
hinder | utrudniać | Bad weather hindered the repairs.
impede | utrudniać, hamować | Old equipment impedes our growth.
underpin | stanowić podstawę | Trust underpins every good relationship.
warrant | uzasadniać; nakaz | The situation warrants immediate action.
alleviate | łagodzić | We added capacity to alleviate congestion.
ascertain | ustalać, upewniać się | We need to ascertain the cause of the failure.
bolster | wzmacniać | The new contract will bolster our position.
curtail | ograniczać | We had to curtail our spending.
encompass | obejmować | The project encompasses all regional offices.
garner | zdobywać, zyskiwać | The idea garnered a lot of support.
compelling | przekonujący | She made a compelling case for the investment.
` }
];
