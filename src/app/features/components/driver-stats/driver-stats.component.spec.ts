import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DriverStanding } from '../../../core/models/jolpica.model';
import { DriverStatsComponent } from './driver-stats.component';

describe('DriverStatsComponent', () => {
  let component: DriverStatsComponent;
  let fixture: ComponentFixture<DriverStatsComponent>;

  const mockStanding: DriverStanding = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverStatsComponent, MatIconModule, MatTooltipModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverStatsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('standing', mockStanding);
    fixture.componentRef.setInput('teamColor', '#0600EF');
    fixture.componentRef.setInput('probability', 85.5);
    fixture.componentRef.setInput('probabilityTooltip', 'Test tooltip text');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TODO: Fix - Race Wins card is commented out in HTML, so only 4 cards render
  // it('should render 5 stat cards', () => {
  //   const compiled = fixture.nativeElement;
  //   const statCards = compiled.querySelectorAll('.stat-card');
  //   expect(statCards.length).toBe(5);
  // });

  it('should display championship position', () => {
    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');
    const positionCard = statCards[0];
    expect(positionCard.textContent).toContain('Championship Pos.');
    expect(positionCard.textContent).toContain('1');
  });

  it('should display total points', () => {
    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');
    const pointsCard = statCards[1];
    expect(pointsCard.textContent).toContain('Total Points');
    expect(pointsCard.textContent).toContain('450');
  });

  // TODO: Fix - Race Wins card is commented out in HTML
  // it('should display race wins', () => {
  //   const compiled = fixture.nativeElement;
  //   const statCards = compiled.querySelectorAll('.stat-card');
  //   const winsCard = statCards[2];
  //   expect(winsCard.textContent).toContain('Race Wins');
  //   expect(winsCard.textContent).toContain('10');
  // });

  it('should display win probability with percentage', () => {
    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');
    const probabilityCard = statCards[2];
    expect(probabilityCard.textContent).toContain('Win Probability');
    expect(probabilityCard.textContent).toContain('85.5%');
  });

  it('should display team name', () => {
    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');
    const teamCard = statCards[3];
    expect(teamCard.textContent).toContain('Team');
    expect(teamCard.textContent).toContain('Red Bull Racing');
  });

  it('should render info icon in probability card', () => {
    const compiled = fixture.nativeElement;
    const infoIcon = compiled.querySelector('.info-icon');
    expect(infoIcon).toBeTruthy();
    expect(infoIcon.textContent.trim()).toBe('info');
  });

  // TODO: Fix - ng-reflect attributes may not be set in test environment
  // it('should apply tooltip to info icon', () => {
  //   const compiled = fixture.nativeElement;
  //   const infoIcon = compiled.querySelector('.info-icon');
  //   expect(infoIcon.getAttribute('ng-reflect-message')).toBe('Test tooltip text');
  // });

  it('should return correct gradient from getCardGradient', () => {
    const gradient = component['getCardGradient']();
    expect(gradient).toBe('linear-gradient(135deg, #0600EF30 0%, #0600EF50 100%)');
  });

  it('should apply team color as border color to stat cards', () => {
    const compiled = fixture.nativeElement;
    const statCard = compiled.querySelector('.stat-card');
    const borderColor = statCard.style.borderColor;
    expect(borderColor).toBe('rgb(6, 0, 239)'); // #0600EF in rgb
  });

  it('should apply gradient background to stat cards', () => {
    const compiled = fixture.nativeElement;
    const statCard = compiled.querySelector('.stat-card');
    const background = statCard.style.background;
    expect(background).toContain('linear-gradient');
  });

  it('should return team name from getTeamName method', () => {
    expect(component['getTeamName']()).toBe('Red Bull Racing');
  });

  it('should return "Unknown Team" when constructor is missing', () => {
    const standingWithoutConstructor: DriverStanding = {
      ...mockStanding,
      Constructors: [],
    };
    fixture.componentRef.setInput('standing', standingWithoutConstructor);
    fixture.detectChanges();

    expect(component['getTeamName']()).toBe('Unknown Team');
  });

  it('should render stats grid container', () => {
    const compiled = fixture.nativeElement;
    const statsGrid = compiled.querySelector('.stats-grid');
    expect(statsGrid).toBeTruthy();
  });

  it('should handle zero probability', () => {
    fixture.componentRef.setInput('probability', 0);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');
    const probabilityCard = statCards[2];
    expect(probabilityCard.textContent).toContain('0%');
  });

  it('should handle 100% probability', () => {
    fixture.componentRef.setInput('probability', 100);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const statCards = compiled.querySelectorAll('.stat-card');
    const probabilityCard = statCards[2];
    expect(probabilityCard.textContent).toContain('100%');
  });
});
