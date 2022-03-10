import {Component, OnInit} from '@angular/core';
import {DashboardService} from "../../service/dashboard.service";
import {AnneeService} from "../../service/annee.service";
import {LocalStorageService} from "ngx-webstorage";
import {CustomResponse} from "../../interface/custom.response";
import {AppState} from "../../interface/app-state";
import {BehaviorSubject, Observable, of, Subscription} from "rxjs";
import {NotificationServiceService} from "../../service/notification.service.service";
import {AnneeResponse} from "../../interface/annee.response";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AppConfigService} from "../../config/app.config.service";
import {AppConfig} from "../../config/app.config";
import {catchError, map, startWith} from "rxjs/operators";
import {DataState} from "../../enum/data.state.enum";
import {DashboardDataResponse} from "../../interface/dashboard.data.response";
import {Datasets} from "../../interface/datasets";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  display: boolean = true;
  headerText: string = "INIT DATA SESSIONS";
  form: FormGroup;

  appState$: Observable<AppState<CustomResponse>> | null = null;
  readonly DataSate = DataState;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  idAnnee: number;

  customResponse: CustomResponse;

  listAnnees: AnneeResponse [] = [];
  annee: AnneeResponse;


  pie_data_char: any;
  bar_data_char: any;
  line_data_char: any;
  pie_bc_data_char: any;

  pie_chart_options: any;
  bar_chart_options: any;
  line_char_options: any;

  subscription: Subscription;

  config: AppConfig;

  nbContributeur = 5;

  constructor(
    private localStorage: LocalStorageService,
    private anneeService: AnneeService,
    private dashboardService: DashboardService,
    private notifier: NotificationServiceService,
    private configService: AppConfigService) {
    this.listAnnees = this.anneeService.findAll();

    let year = localStorage.retrieve('id_annee')
    if (year) {
      this.display = false;
      this.idAnnee = parseInt(year);
      this.anneeService.getDataByIdAnnee(this.idAnnee).then(data => this.annee = data);
    }

    this.form = new FormGroup({
      idAnnee: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.load();
    this.loadAllCharData();
  }


  load() {
    if (this.idAnnee) {
      this.appState$ = this.dashboardService.dashboard$(this.idAnnee)
        .pipe(
          map(response => {
            this.dataSubject.next(response);
            this.notifier.onSuccess(response.message);
            return {
              dataState: DataState.LOADED_STATE,
              appData: {...response, datas: {dashboard: response.datas.dashboard}}
            }
          }),
          startWith({dataState: DataState.LOADING_STATE}),
          catchError((error: string) => {
            this.notifier.onError(error);
            return of({dataState: DataState.ERROR_STATE, error: error})
          })
        );
    }
  }


  private initBarCharDataset(datasets: Datasets []) {
    let result: any[] = [];
    datasets.forEach(item => {
      let val = {
        label: item.label,
        data: item.data,
        backgroundColor: this.getOtherColor(),
        yAxisID: 'y'
      };
      result.push(val);
    });
    return result;
  }

  private fill_bar_char_data(datas: DashboardDataResponse) {
    this.initBarCharOptions();
    this.bar_data_char = {
      labels: datas.charData.bar_char.labels,
      datasets: this.initBarCharDataset(datas.charData.bar_char.datasets)
    };
  }

  private fill_pie_char_data(datas: DashboardDataResponse) {
    this.pie_data_char = {
      labels: datas.charData.pie_char.labels,
      datasets: [
        {
          data: datas.charData.pie_char.datasets[0].data,
          backgroundColor: this.initColor(datas.charData.pie_char.datasets[0].data.length, this.getBackgroundColor()),
          hoverBackgroundColor: this.initColor(datas.charData.pie_char.datasets[0].data.length, this.getHoverBackgroundColor())
        }
      ]
    };

    this.config = this.configService.config;
    this.updateChartOptions();
    this.subscription = this.configService.configUpdate$.subscribe(config => {
      this.config = config;
      this.updateChartOptions();
    });
  }

  private fill_pie_bc_char_data(datas: DashboardDataResponse) {
    this.pie_bc_data_char = {
      labels: datas.charData.pie_bc_char.labels,
      datasets: [
        {
          data: datas.charData.pie_bc_char.datasets[0].data,
          backgroundColor: this.initColor(datas.charData.pie_bc_char.datasets[0].data.length, this.getBackgroundColor()),
          hoverBackgroundColor: this.initColor(datas.charData.pie_bc_char.datasets[0].data.length, this.getHoverBackgroundColor())
        }
      ]
    };
  }

  private initLineDataset(datasets: Datasets []) {
    let result: any[] = [];
    let initialColor = this.getOtherColor();

    datasets.forEach(item => {

      let color = this.getRandomItems(initialColor);
      initialColor.splice(initialColor.indexOf(color), 1);
      let fill_flag = (Math.random() >= 0.5);
      let val = {
        label: item.label,
        data: item.data,
        fill: fill_flag,
        tension: .4,
        borderColor: `${color}`,
        backgroundColor: fill_flag ? `rgba(255, 167, 38, 0.2)` : ``,
        //borderDash: [5, 5]
      };
      result.push(val);
    });
    return result;
  }

  private fill_line_char_data(datas: DashboardDataResponse) {
    this.line_data_char = {
      labels: datas.charData.line_char.labels,
      datasets: this.initLineDataset(datas.charData.line_char.datasets)
    };

    this.config = this.configService.config;
    this.updateChartOptions();
    this.subscription = this.configService.configUpdate$.subscribe(config => {
      this.config = config;
      this.updateChartOptions();
    });
  }


  save(): void {
    this.isLoading.next(true);
    let index = this.listAnnees.findIndex(item => item.idAnnee === parseInt(this.form.value.idAnnee));
    this.localStorage.store("id_annee", this.form.value.idAnnee)
    this.localStorage.store("date_debut", this.listAnnees[index].dateDebut);
    this.localStorage.store("date_fin", this.listAnnees[index].dateFin);
    this.isLoading.next(false);
    this.display = false;

    this.idAnnee = parseInt(this.form.value.idAnnee);
    this.annee = this.listAnnees[index];
    this.load();
    this.loadAllCharData();
  }


  updateChartOptions() {
    this.pie_chart_options = this.config && this.config.dark ? this.getDarkTheme() : this.getLightTheme();
  }

  getLightTheme() {
    return {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      }
    }
  }

  getDarkTheme() {
    return {
      plugins: {
        legend: {
          labels: {
            color: '#ebedef'
          }
        }
      }
    }
  }

  async loadAllCharData() {
    if (this.idAnnee) {
      let data = await this.getData(this.appState$);
      this.fill_pie_char_data(data);
      this.fill_line_char_data(data);
      this.fill_bar_char_data(data);
      this.fill_pie_bc_char_data(data);
    }
  }

  getData(value: Observable<AppState<CustomResponse>>) {
    return value.toPromise()
      .then(res => <AppState<CustomResponse>>res)
      .then(data => {
        return data.appData.datas.dashboard;
      })
  }

  getRandomInt(value) {
    return Math.floor(Math.random() * value);
  }

  getBackgroundColor() {
    return ["#42A5F5", "#66BB6A",
      "#FFA726", "#29e558", "#bddb13"]
  }

  getHoverBackgroundColor() {
    return [
      "#64B5F6",
      "#81C784", "#FFB74D",
      "#29e5F5", "#bddb13"];
  }


  getOtherColor() {
    return ['#EC407A', '#AB47BC',
      '#42A5F5', '#7E57C2',
      '#66BB6A', '#FFCA28', '#26A69A',
    ];
  }

  initColor(size: number, table: string []) {
    return table.slice(0, (size));
  }

  private getRandomItem(value: number, table: string []) {
    return table [Math.floor(Math.random() * value)]
  }

  private getRandomItems(table: string []) {
    return table [Math.floor(Math.random() * table.length)]
  }


  private initBarCharOptions(): void {
    this.bar_chart_options = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        },
        tooltips: {
          mode: 'index',
          intersect: true
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          ticks: {
            min: 0,
            max: 100,
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
      }
    };
  }

  get f() {
    return this.form.controls;
  }
}
