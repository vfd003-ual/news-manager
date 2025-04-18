import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsFilterComponent } from './news-filter.component';

describe('NewsFilterComponent', () => {
  let component: NewsFilterComponent;
  let fixture: ComponentFixture<NewsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
