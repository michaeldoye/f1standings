import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { of, throwError } from 'rxjs';
import { Driver } from '../../../core/models/driver.model';
import { DriverStanding, Race } from '../../../core/models/jolpica.model';
import { JolpicaApiService } from '../../../core/services/jolpica-api.service';
import { OpenF1ApiService } from '../../../core/services/openf1-api.service';
import { DriverStandingCardComponent } from '../driver-standing-card/driver-standing-card.component';
import { StandingsComponent } from './standings.component';

describe('StandingsComponent', () => {
  let component: StandingsComponent;
  let fixture: ComponentFixture<StandingsComponent>;
  let jolpicaService: jasmine.SpyObj<JolpicaApiService>;
  let openF1Service: jasmine.SpyObj<OpenF1ApiService>;

  const mockDriverStandings: DriverStanding[] = [
    {
      position: '1',
      positionText: '1',
      points: '450',
      wins: '10',
      Driver: {
        driverId: 'verstappen',
        permanentNumber: '1',
        code: 'VER',
        givenName: 'Max',
        familyName: 'Verstappen',
        dateOfBirth: '1997-09-30',
        nationality: 'Dutch',
      },
      Constructors: [
        {
          constructorId: 'red_bull',
          name: 'Red Bull Racing',
          nationality: 'Austrian',
        },
      ],
    },
    {
      position: '2',
      positionText: '2',
      points: '350',
      wins: '5',
      Driver: {
        driverId: 'perez',
        permanentNumber: '11',
        code: 'PER',
        givenName: 'Sergio',
        familyName: 'Perez',
        dateOfBirth: '1990-01-26',
        nationality: 'Mexican',
      },
      Constructors: [
        {
          constructorId: 'red_bull',
          name: 'Red Bull Racing',
          nationality: 'Austrian',
        },
      ],
    },
  ];

  const mockDrivers: Driver[] = [
    {
      broadcast_name: 'M VERSTAPPEN',
      country_code: 'NED',
      driver_number: 1,
      first_name: 'Max',
      full_name: 'Max VERSTAPPEN',
      headshot_url: 'https://example.com/verstappen.png',
      last_name: 'VERSTAPPEN',
      meeting_key: 1234,
      name_acronym: 'VER',
      session_key: 9999,
      team_colour: '0600EF',
      team_name: 'Red Bull Racing',
    },
    {
      broadcast_name: 'S PEREZ',
      country_code: 'MEX',
      driver_number: 11,
      first_name: 'Sergio',
      full_name: 'Sergio PEREZ',
      headshot_url: 'https://example.com/perez.png',
      last_name: 'PEREZ',
      meeting_key: 1234,
      name_acronym: 'PER',
      session_key: 9999,
      team_colour: '0600EF',
      team_name: 'Red Bull Racing',
    },
  ];

  const mockRaces: Race[] = [
    {
      season: '2024',
      round: '1',
      raceName: 'Bahrain Grand Prix',
      Circuit: {
        circuitId: 'bahrain',
        circuitName: 'Bahrain International Circuit',
        Location: {
          lat: '26.0325',
          long: '50.5106',
          locality: 'Sakhir',
          country: 'Bahrain',
        },
      },
      date: '2024-03-02',
      time: '15:00:00Z',
    },
    {
      season: '2024',
      round: '24',
      raceName: 'Abu Dhabi Grand Prix',
      Circuit: {
        circuitId: 'yas_marina',
        circuitName: 'Yas Marina Circuit',
        Location: {
          lat: '24.4672',
          long: '54.6031',
          locality: 'Abu Dhabi',
          country: 'UAE',
        },
      },
      date: '2099-12-08',
      time: '13:00:00Z',
    },
  ];

  beforeEach(async () => {
    const jolpicaSpy = jasmine.createSpyObj('JolpicaApiService', [
      'getCurrentDriverStandings',
      'getCurrentSeasonRaces',
      'getDriverStandingsByRound',
    ]);
    const openF1Spy = jasmine.createSpyObj('OpenF1ApiService', ['getLatestSessionDrivers']);

    await TestBed.configureTestingModule({
      imports: [
        StandingsComponent,
        DriverStandingCardComponent,
        MatExpansionModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: JolpicaApiService, useValue: jolpicaSpy },
        { provide: OpenF1ApiService, useValue: openF1Spy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    jolpicaService = TestBed.inject(JolpicaApiService) as jasmine.SpyObj<JolpicaApiService>;
    openF1Service = TestBed.inject(OpenF1ApiService) as jasmine.SpyObj<OpenF1ApiService>;

    jolpicaService.getCurrentDriverStandings.and.returnValue(of(mockDriverStandings));
    jolpicaService.getCurrentSeasonRaces.and.returnValue(of(mockRaces));
    jolpicaService.getDriverStandingsByRound.and.returnValue(of(mockDriverStandings));
    openF1Service.getLatestSessionDrivers.and.returnValue(of(mockDrivers));

    fixture = TestBed.createComponent(StandingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load standings on init', () => {
    fixture.detectChanges();
    expect(jolpicaService.getCurrentDriverStandings).toHaveBeenCalled();
    expect(openF1Service.getLatestSessionDrivers).toHaveBeenCalled();
    expect(jolpicaService.getCurrentSeasonRaces).toHaveBeenCalled();
  });

  it('should set loading to false after data is loaded', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component['loading']()).toBe(false);
      done();
    }, 100);
  });

  it('should populate driver standings', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      expect(component['driverStandings']().length).toBe(2);
      done();
    }, 100);
  });

  it('should populate team colors map', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const colorMap = component['teamColors']();
      expect(colorMap.get('1')).toBe('0600EF');
      expect(colorMap.get('11')).toBe('0600EF');
      done();
    }, 100);
  });

  it('should calculate championship probabilities', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const probabilities = component['championshipProbabilities']();
      expect(probabilities.size).toBeGreaterThan(0);
      done();
    }, 100);
  });

  it('should handle API error', (done) => {
    jolpicaService.getCurrentDriverStandings.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();
    setTimeout(() => {
      expect(component['error']()).toBeTruthy();
      expect(component['loading']()).toBe(false);
      done();
    }, 100);
  });

  it('should convert nationality to country flag', () => {
    const flag = component['getCountryFlag']('Dutch');
    expect(flag).toBe('🇳🇱');
  });

  it('should return checkered flag for unknown nationality', () => {
    const flag = component['getCountryFlag']('Unknown');
    expect(flag).toBe('🏁');
  });

  it('should get team color from map', () => {
    fixture.detectChanges();
    setTimeout(() => {
      const color = component['getTeamColor'](mockDriverStandings[0]);
      expect(color).toBe('#0600EF');
    }, 100);
  });

  it('should return default color when team color not found', () => {
    const standingWithUnknownNumber: DriverStanding = {
      ...mockDriverStandings[0],
      Driver: {
        ...mockDriverStandings[0].Driver,
        permanentNumber: '999',
      },
    };

    fixture.detectChanges();
    const color = component['getTeamColor'](standingWithUnknownNumber);
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/); // Should return a valid hex color
  });

  it('should get championship probability from map', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const probability = component['getChampionshipProbability'](mockDriverStandings[0]);
      expect(probability).toBeGreaterThanOrEqual(0);
      done();
    }, 100);
  });

  it('should generate probability tooltip', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const tooltip = component['getProbabilityTooltip'](mockDriverStandings[0]);
      expect(tooltip).toContain('championship leader');
      done();
    }, 100);
  });

  it('should increment step on nextStep()', () => {
    component['step'].set(0);
    component['nextStep']();
    expect(component['step']()).toBe(1);
  });

  it('should decrement step on prevStep()', () => {
    component['step'].set(1);
    component['prevStep']();
    expect(component['step']()).toBe(0);
  });

  it('should set step on setStep()', () => {
    component['setStep'](5);
    expect(component['step']()).toBe(5);
  });

  // TODO: Fix template query - currently fails in headless mode
  // it('should display loading spinner when loading', () => {
  //   component['loading'].set(true);
  //   fixture.detectChanges();

  //   const compiled = fixture.nativeElement;
  //   const spinner = compiled.querySelector('mat-spinner');
  //   expect(spinner).toBeTruthy();
  // });

  it('should display error message when error occurs', () => {
    component['error'].set('Test error message');
    component['loading'].set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorMessage = compiled.querySelector('.error-message');
    expect(errorMessage.textContent).toBe('Test error message');
  });

  // TODO: Fix template query - currently fails in headless mode
  // it('should display no data message when standings array is empty', () => {
  //   component['driverStandings'].set([]);
  //   component['loading'].set(false);
  //   component['error'].set(null);
  //   fixture.detectChanges();

  //   const compiled = fixture.nativeElement;
  //   const noDataMessage = compiled.querySelector('.no-data-message');
  //   expect(noDataMessage).toBeTruthy();
  // });

  it('should render driver standing cards when data is loaded', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const cards = compiled.querySelectorAll('app-driver-standing-card');
      expect(cards.length).toBe(2);
      done();
    }, 100);
  });

  it('should calculate leader probability correctly', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const leaderProbability = component['getChampionshipProbability'](mockDriverStandings[0]);
      expect(leaderProbability).toBeGreaterThan(50);
      done();
    }, 100);
  });

  it('should calculate challenger probability correctly', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const challengerProbability = component['getChampionshipProbability'](mockDriverStandings[1]);
      expect(challengerProbability).toBeLessThan(50);
      done();
    }, 100);
  });

  it('should generate different tooltips for different positions', (done) => {
    fixture.detectChanges();
    setTimeout(() => {
      const tooltip1 = component['getProbabilityTooltip'](mockDriverStandings[0]);
      const tooltip2 = component['getProbabilityTooltip'](mockDriverStandings[1]);
      expect(tooltip1).not.toBe(tooltip2);
      done();
    }, 100);
  });
});
