import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DriverStanding } from '../../../core/models/jolpica.model';
import { DriverInfoComponent } from './driver-info.component';

describe('DriverInfoComponent', () => {
  let component: DriverInfoComponent;
  let fixture: ComponentFixture<DriverInfoComponent>;

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
      imports: [DriverInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverInfoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('standing', mockStanding);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display driver full name', () => {
    const compiled = fixture.nativeElement;
    const fullNameValue = compiled.querySelector('.info-item:first-child .value');
    expect(fullNameValue.textContent).toContain('Max Verstappen');
  });

  it('should display driver code', () => {
    const compiled = fixture.nativeElement;
    const elements = compiled.querySelectorAll('.info-item');
    const codeElement = Array.from(elements).find((el: any) =>
      el.textContent.includes('Driver Code:')
    ) as HTMLElement;
    expect(codeElement.textContent).toContain('VER');
  });

  it('should display permanent number', () => {
    const compiled = fixture.nativeElement;
    const elements = compiled.querySelectorAll('.info-item');
    const numberElement = Array.from(elements).find((el: any) =>
      el.textContent.includes('Permanent Number:')
    ) as HTMLElement;
    expect(numberElement.textContent).toContain('#1');
  });

  it('should display nationality', () => {
    const compiled = fixture.nativeElement;
    const elements = compiled.querySelectorAll('.info-item');
    const nationalityElement = Array.from(elements).find((el: any) =>
      el.textContent.includes('Nationality:')
    ) as HTMLElement;
    expect(nationalityElement.textContent).toContain('Dutch');
  });

  it('should display date of birth', () => {
    const compiled = fixture.nativeElement;
    const elements = compiled.querySelectorAll('.info-item');
    const dobElement = Array.from(elements).find((el: any) =>
      el.textContent.includes('Date of Birth:')
    ) as HTMLElement;
    expect(dobElement.textContent).toContain('1997-09-30');
  });

  it('should display constructor name', () => {
    const compiled = fixture.nativeElement;
    const elements = compiled.querySelectorAll('.info-item');
    const constructorElement = Array.from(elements).find((el: any) =>
      el.textContent.includes('Constructor:')
    ) as HTMLElement;
    expect(constructorElement.textContent).toContain('Red Bull Racing');
  });

  it('should display N/A when constructor is missing', () => {
    const standingWithoutConstructor: DriverStanding = {
      ...mockStanding,
      Constructors: [],
    };
    fixture.componentRef.setInput('standing', standingWithoutConstructor);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const elements = compiled.querySelectorAll('.info-item');
    const constructorElement = Array.from(elements).find((el: any) =>
      el.textContent.includes('Constructor:')
    ) as HTMLElement;
    expect(constructorElement.textContent).toContain('N/A');
  });

  it('should return correct full name from getDriverFullName method', () => {
    expect(component['getDriverFullName']()).toBe('Max Verstappen');
  });

  it('should render all 6 info items', () => {
    const compiled = fixture.nativeElement;
    const infoItems = compiled.querySelectorAll('.info-item');
    expect(infoItems.length).toBe(6);
  });

  it('should render info grid container', () => {
    const compiled = fixture.nativeElement;
    const infoGrid = compiled.querySelector('.info-grid');
    expect(infoGrid).toBeTruthy();
  });

  it('should render section header', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('h3');
    expect(header.textContent).toBe('Driver Information');
  });
});
