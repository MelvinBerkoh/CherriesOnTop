document.addEventListener("DOMContentLoaded", function () {
  const monthYear = document.getElementById("monthYear");
  const daysOfWeekContainer = document.querySelector(".days-of-week");
  const calendarDays = document.querySelector(".calendar-days");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const eventDetails = document.getElementById("eventDetails");
  const eventInfo = document.getElementById("eventInfo");
  
  const events = {
    "2025-05-31":{
    description: "27th Annual Spring Show 10:00 AM - 5:00 PM At Municipal Field, 134 Main Street, Chester, NJ",
    url:"abc.1223.com"},
    "2025-06-01":{ description: "27th Annual Spring Show 10:00 AM - 5:00 PM At Municipal Field, 134 Main Street, Chester, NJ",
        url:""
    },
    "2025-09-06":{description: "27th Annual Spring Show 10:00 AM - 5:00 PM At Municipal Field, 134 Main Street, Chester, NJ",
        url:""
    },
    "2025-09-07":{description: "27th Annual Spring Show 10:00 AM - 5:00 PM At Municipal Field, 134 Main Street, Chester, NJ",
        url:""
    },
    "2025-05-03":{description: "Booked for a private event",
        url:""
    },
    "2025-06-05":{" Wind Gap Blues Festival, Mountain View Park, 206 E Mountain Rd, Wind Gap, PA"},
    "2025-06-06":{description:" Wind Gap Blues Festival, Mountain View Park, 206 E Mountain Rd, Wind Gap, PA",
        url:"https://www.windgapbluegrass.com/ "
    },
    "2025-06-07":{description:" Wind Gap Blues Festival, Mountain View Park, 206 E Mountain Rd, Wind Gap, PA",
        url:"https://www.windgapbluegrass.com/ "
    },
    "2025-06-08":{description:" Wind Gap Blues Festival, Mountain View Park, 206 E Mountain Rd, Wind Gap, PA",
        url:"https://www.windgapbluegrass.com/ "
    },
    "2025-06-21":{ description: "Booked for a private event",
        url:""
    },
    "2025-06-22":{ description: "Booked for a private event",
        url:""
    },
    "2025-06-28":{ description: "Booked for a private event",
        url:""
    },
    "2025-07-26":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-07-27":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-07-28":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-07-29":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-07-30":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-07-31":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-08-01":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-08-02":{ description: "Warren County Farmers Fair & Balloon Festival 877 Uniontown Rd, Phillipsburg, NJ 08865",
        url:"https://www.warrencountyfarmersfair.org/"
        },
    "2025-08-09":{ description: "CHESTER SUMMER FOOD TRUCK & MUSIC FESTIVAL by Just Jersey Fest. Municipal Field, 134 Main St, Chester, NJ",
        url:"www.justjerseyfest.com"
    },
    "2025-09-06":{ description: "Rose Squared/Fall Chester Craft Show 134 Main Street, Chester NJ ",
        url:"https://ilovechester.com/51st-annual-chester-fall-craft-show"
    },
    "2025-09-07":{ description: "Rose Squared/Fall Chester Craft Show 134 Main Street, Chester NJ ",
        url:"https://ilovechester.com/51st-annual-chester-fall-craft-show"
    },
    "2025-09-14":{ description: "Art in the Park Liberty Park - 168 Main St, Peapack, NJ 07977", 
        url:"https://www.instagram.com/artintheparknj/"
    },
    "2025-09-20":{ description: "Washington Festival in the Borough Downtown Washington Borough 44 E Washington Ave, Washington, NJ 07882-1913, United States",
        url:"https://www.washingtonbid.org/festival-in-the-borough"
    }
  };
  
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let currentDate = new Date();

  function renderCalendar() {
      calendarDays.innerHTML = "";
      daysOfWeekContainer.innerHTML = "";

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      monthYear.textContent = currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
      });

      daysOfWeek.forEach(day => {
          const dayElement = document.createElement("div");
          dayElement.textContent = day;
          daysOfWeekContainer.appendChild(dayElement);
      });

      for (let i = 0; i < firstDay; i++) {
          const emptyCell = document.createElement("div");
          calendarDays.appendChild(emptyCell);
      }

      for (let day = 1; day <= daysInMonth; day++) {
          const dayElement = document.createElement("div");
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          dayElement.textContent = day;
          dayElement.dataset.date = dateStr;
          dayElement.style.cursor = "pointer";
          
          if (events[dateStr]) {
              dayElement.style.backgroundColor = "#C9AF92";
              dayElement.style.color = "white";
              dayElement.style.fontWeight = "bold";
          }
          
          dayElement.addEventListener("click", function () {
              if (events[dateStr]) {
                  eventInfo.textContent = events[dateStr];
                  eventDetails.classList.remove("hidden");
              } else {
                  eventInfo.textContent = "No events on this date.";
                  eventDetails.classList.remove("hidden");
              }
          });

          calendarDays.appendChild(dayElement);
      }
  }

  prevMonthBtn.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
  });

  nextMonthBtn.addEventListener("click", function () {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
  });

  renderCalendar();
});

// Handle the logic to include a clickable link 
dayElement.addEventListener("click", function () {
    const event = events[dateStr];
    if (event) {
        eventInfo.innerHTML = `<a href="${event.url}" target="_blank" style="color: blue; text-decoration: underline;">${event.description}</a>`;
        eventDetails.classList.remove("hidden");
    } else {
        eventInfo.textContent = "No events on this date.";
        eventDetails.classList.remove("hidden");
    }
});
