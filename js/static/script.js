const api_url = "http://localhost:8080";
const page_size = 100;
function concat_url(...args) {
	return new URL(args.join("/"),api_url).href;
}
const virusFieldNames = ["id", "name","type", "firstTransmissionProbability", "averageContractTime", "mortality", "secondTransmissionProbability"];
const virusColumnNames = ["ID","Имя","Тип","Вероятность передачи","Средний срок заражения","Смертность","Вероятность повторного заражения"];
const humanFieldNames = ["id", "deathDate", "injuries"];
const humanColumnNames = ["ID", "Дата смерти", "Болезни"];
var eVirus = {};
virusFieldNames.map((el)=>eVirus[el]=null);
const emptyVirus = eVirus;
const virusNamePairs = virusFieldNames.map((el, i) => ({"name":el, "label":virusColumnNames[i]}));
const typeVariants = ["DNA","RNA","RETROVIRUS"];
const virus_table = "virus_table";
const human_table = "human_table";
const App = {
	data: () => ({
		        iface:virus_table,
			otherIface: human_table,
			virus_spec: {
				page:null,
				status:"add",
				virus:Object.assign({},emptyVirus),
				isUpdating:false,
				columnNames: virusColumnNames,
				fieldNames: virusFieldNames,
				namePairs: virusNamePairs,
				typeVariants: typeVariants,
				pageNumber: 0,
				totalPages: 0,
			},
			human_spec: {
				infection: {
					humanNumber: null,
					date: null,
					virus: null,
				},
				viruses: [],
				page: null,
				columnNames: humanColumnNames,
				fieldNames: humanFieldNames,
				pageNumber: 0,
				totalPages: 0
			}
		}),
	methods: {
		deleteVirusRow(row) {
			console.log("deleting "+row.id)
			fetch(concat_url("viruses",row.id.toString()), 
				{
				method: 'DELETE'
			}
			).then((response)=>console.log(response))
			.finally(this.updateUI);
		},
		updateVirus() {
			var id = virus.id;
			fetch(concat_url("viruses",id), {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body:JSON.stringify(this.virus_spec.virus)
			}
			)
				.then((response=>{
			console.log(response);
			}
			));
			console.log(result);
		},
		addVirus(submitEvent)
		{
			var toSend={};
			Object.assign(toSend,this.virus_spec.virus);
			delete toSend.id;
			fetch(concat_url("viruses","add"), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(toSend)
			}
			)
			.finally(this.updateUI);
		},
		toUpdate(row){
			Object.assign(this.virus_spec.virus,row);
			this.virus_spec.status="update";
		},
		submitVirus()
		{
			if (this.virus_spec.status == "add")
				this.addVirus();
			else this.updateVirus();
			Object.assign(this.virus_spec.virus,emptyVirus);
			this.virus_spec.status="update";
			updateUI();
		},
		infectHumans()
		{
			var infection = this.human_spec.infection;
			fetch(
				concat_url(`infect?virusId=${this.getVirusIdByName(infection.virus)}&humanNumber=${infection.humanNumber}`),
				{
					method: 'POST'
				}
			)
				.then(this.updateUI);
		},
		updateUI() {
			switch(this.iface)
			{
				case virus_table:
					fetch(concat_url(`/viruses?page=${this.virus_spec.pageNumber}&size=${page_size}`))
					.then(response => {
						if (!response.ok) throw Error(response.statusText);
						return response.json();
					})
					.then(json=>{
						this.virus_spec.page = json.content;
						this.virus_spec.totalPages = json.totalPages;
					})
					break;
				case human_table:
					fetch(concat_url(`/humans?page=${this.human_spec.pageNumber}&size=${page_size}`))
					.then(response => {
						if (!response.ok) throw Error(response.statusText);
						return response.json();
					})
					.then(json=>{
						this.human_spec.page = json.content;
						this.human_spec.totalPages = json.totalPages;
					})
					fetch(concat_url("date"))
					.then(response => {
						if (!response.ok) throw Error(response.statusText);
						return response.json();
					})
					.then((json)=> {
						this.human_spec.infection.date = json;
					});
					fetch(concat_url("viruses","names"))
					.then(response => {
						if (!response.ok) throw Error(response.statusText);
						return response.json();
					})
					.then((json) => {this.human_spec.viruses=Array.from(json)})
					break;
			}
		},
		isType:(name)=>name=='type',
		notId:(name)=>name!='id',
		createMillionHumans(){
			fetch(concat_url("humans","addMillion"),{
				method: 'POST'
			}
			)
			.finally(()=>this.updateUI())
		},
		getInjuryVirusName: (injury)=>{
			return this.getVirusName(injury.virus);
		},
		getVirusName: (virus)=>virus.name,
		getVirusIdByName(name){
			console.log(this.human_spec.viruses);
			return this.human_spec.viruses.find((virus)=>virus.name==name).id;
		},
		nextPage() {
			if (this.isVirusTable() && this.virus_spec.pageNumber<this.virus_spec.totalPages-1)
			{
				this.virus_spec.pageNumber++;
				this.updateUI();
			}
			else if (this.isHumanTable() && this.human_spec.pageNumber<this.human_spec.totalPages-1)
			{
				this.human_spec.pageNumber++;
				this.updateUI();
			}
		},
		previousPage() {
			if (this.isVirusTable() && this.virus_spec.pageNumber>0)
				this.virus_spec.pageNumber--;
			else if (this.isHumanTable() && this.human_spec.pageNumber>0)
				this.human_spec.pageNumber--;
			this.updateUI();
		},
		isVirusTable(){
			return this.iface==virus_table;
		},
		isHumanTable(){
			return this.iface==human_table;
		},
		switchIface()
		{
			this.otherIface = this.iface;
			if (this.isVirusTable())
			{
				this.iface = human_table;
			}
			else
			{
				this.iface = virus_table;
			}
			this.updateUI();

		}
	},
	mounted(){
		this.updateUI();
	}
};
Vue.createApp(App).mount("#app");
