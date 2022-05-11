import React, { Component } from 'react'
import { View } from 'react-native'
import { Calendar } from 'react-native-calendars'
import EventCalendar from './eventCal/EventCalendar'
import { LocaleConfig } from 'react-native-calendars'
import * as defaultStyle from './defaultStyles'
import setupLocales from './locales'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { formatDate } from './utils'

class DynamicCalendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      calendarRender: true,
      chosenDay: moment().format('YYYY-MM-DD'),
      goBackTrigger: false,
      datesHash: new Map(),
      agendaEvents: [],
    }
    setupLocales()
  }

  // runs when user clicks calendar day
  onDayPress = (day) => {

    const dateNow = moment().format('YYYY-MM-DD')

    if (day.dateString < dateNow) {
      return
    }

    let { oneEventAction } = this.props
    if (oneEventAction === 'action') {
      let {workDays} = this.props

      if (workDays !== undefined && workDays.length !== 0) {
        let workDay = workDays.find((dayWork) => this.splitDate(dayWork.dateMarking) === day.dateString)
        if (!workDay) {
          let { onClickUnmarkingDay } = this.props
          const date = new Date(day.timestamp)
          onClickUnmarkingDay(date)
        } else {
          let { onClickMarkingDay } = workDay
          if (onClickMarkingDay && typeof onClickMarkingDay === 'function') {
            onClickMarkingDay()
            this.setState({ calendarRender: true })
          }
        }
        
      }
    } else {
      this.setState({ calendarRender: false, chosenDay: day.dateString })
    }

    

    // ,
    //   "role": "listItem",
    //   "reference": "workDays"

    // this.setState({ chosenDay: day.dateString })
    // let { oneEventAction } = this.props
    // if (
    //   oneEventAction === 'action' &&
    //   this.state.datesHash.get(day.dateString) === 1
    // ) {
    //   this.setState({ goBackTrigger: true })
    //   let passDate = new Date(day.dateString)
    //   passDate.setDate(passDate.getDate() + 1)
    //   let event = this.state.agendaEvents.filter((event) =>
    //     event.start.includes(day.dateString)
    //   )[0]
    //   let id = event ? event.id : null
    //   if (!id && id !== 0) return
    //   let { onPressCalendar } = this.props.items[Number(id)]
    //   if (onPressCalendar && typeof onPressCalendar === 'function') {
    //     onPressCalendar()
    //   }
    // } else {
    //   this.setState({ calendarRender: !this.state.calendarRender })
    // }
  }

  // runs when user clicks back button on agenda
  goBack = () => {
    this.setState({ calendarRender: !this.state.calendarRender })
    this.setState({ goBackTrigger: true })
  }

  // renders multi-dot markings on calendar
  multiDotRender = (number, activeColor) => {
    let markerDots = { color: activeColor }
    let multiDotArray = [markerDots]
    for (let i = 0; i < number - 1; ++i) {
      multiDotArray.push(markerDots)
    }
    return multiDotArray
  }

  // returns an array of all dates between the two inputs
  getDates = (startDate, endDate) => {
    let dates = [],
      currentDate = startDate,
      addDays = function (days) {
        let date = new Date(this.valueOf())
        date.setDate(date.getDate() + days)
        return date
      },
      subDays = function (days) {
        let date = new Date(this.valueOf())
        date.setDate(date.getDate() - days)
        return date
      }
    while (currentDate <= endDate) {
      currentDate = addDays.call(currentDate, 1)
      dates.push(subDays.call(currentDate, 1))
    }
    return dates
  }

  // pushes event details onto agenda events array
  pushAgendaEvents = (agendaEvents, i, start, end, title, subtitle) => {
    agendaEvents.push({
      id: i,
      start: start,
      end: end,
      title: title,
      summary: subtitle,
    })
  }

  // runs when user taps an event
  eventTapped = (event) => {
    // const { onPressEvent } = this.props.items[Number(event.id)].agenda
    // if (onPressEvent) {
    //   onPressEvent()
    //   setTimeout(() => this.setState({ calendarRender: true }), 1000)
    // }
    console.log(event)
  }

  filterRespArr = (defaultArr, respArr) => {
    let returnArr = []
    defaultArr.forEach((item) => {
      respArr.forEach((respItem) => {
        if (item.id === respItem.id) {
          returnArr.push(respItem)
        }
      })
    })
    return returnArr
  }

  matchWorkDaysWithZapisi = (filteredWorkDays, zapisi) => {
    return filteredWorkDays.map((item) => {
            let workDayZapisi = []
            zapisi.forEach((zapisItem) => {
              if (item.id == zapisItem.workDayId) {
                workDayZapisi.push(zapisItem)
              }
            })
            return {...item, zapisi: workDayZapisi}
         })
  }

  splitDate = (date) => {
    let dateF = date.split('T')[0]
    return dateF
  }

  workDaysToObject = (workDaysList, zapisiList) => {
    let { dotsColor, workDayColor } = this.props.colors
    let obj = {}

    workDaysList.forEach((workDay) => {
        const formatedDate = formatDate(new Date(workDay.dateMarking), false)
        let zapisi = []
        if (zapisiList && zapisiList.length!==0 && workDaysList && workDaysList.length !== 0
          && zapisiList[0].zapisiDate !== undefined) {
          zapisi = zapisiList
          .filter((zapis) => this.splitDate(zapis.zapisiDate) === this.splitDate(workDay.dateMarking))
          .map((obj) => {
            return {color: dotsColor}
          })
        }
        obj[formatedDate] = {
          dots: zapisi,
          selected: true,
          selectedColor: workDayColor
        }
    })
    return obj
  }

  render() {
    const appStyle = { ...defaultStyle }
    // calendar
    let {
      items,
      workDays,
      zapisi,
      language,
      mondayBegin,
      colors,
      navigation,
      editor,
      markingStyle,
      _fonts,
      openAccordion,
      _height,
    } = this.props

    let objDates = {}

    console.log("workDays", workDays)
    console.log("zapisi", zapisi)

    // && zapisi !== undefined

    if (workDays !== undefined) {
      objDates = this.workDaysToObject(workDays, zapisi) 
    }

    
    const timeFormat = items ? items[0]?.agenda.timeFormat || false : false
    const mondayBeginBool = mondayBegin === 'Sunday' ? 0 : 1
    LocaleConfig.defaultLocale = language
    let monthValue = this.state.chosenDay.substring(
      this.state.chosenDay.length - 5,
      this.state.chosenDay.length - 3
    )
    if (
      this.state.chosenDay[this.state.chosenDay.length - 5].localeCompare(
        '0'
      ) === 0
    ) {
      monthValue = this.state.chosenDay.substring(
        this.state.chosenDay.length - 4,
        this.state.chosenDay.length - 3
      )
    }
    let yearValue = this.state.chosenDay.substring(
      0,
      this.state.chosenDay.length - 6
    )
    let dayValue = this.state.chosenDay.substring(
      this.state.chosenDay.length - 2,
      this.state.chosenDay.length
    )
    let passedTitle =
      dayValue +
      ' ' +
      LocaleConfig.locales[language].monthNames[monthValue - 1] +
      ' ' +
      yearValue
    if (language === 'Japanese' || language === 'Chinese') {
      passedTitle =
        yearValue +
        ' ' +
        LocaleConfig.locales[language].monthNames[monthValue - 1] +
        ' ' +
        dayValue
    }

    const customStylesObj = {
      eventTitle: this.props.agenda.styles.eventTitle,
      eventSubtitle: this.props.agenda.styles.eventSubtitle,
      bodyFont: {
        fontFamily: this.props.agenda.styles.eventTitle.fontFamily,
      },
    }

    const defaultStylesObj = {
      eventTitle: { fontFamily: _fonts.body },
      eventSubtitle: { fontFamily: _fonts.body },
      bodyFont: { fontFamily: _fonts.body },
    }

    // Custom font additions
    const customFontStyles = this.props.agenda?.styles
      ? customStylesObj
      : defaultStylesObj

    // colors
    let { activeColor, textColor, disabledColor, bgColor, headingTextColor } =
      colors
    // navigation
    let { defDate, minDate, maxDate, changeMonths } = navigation
    if (maxDate === '2021-01-01') {
      maxDate = new Date().getFullYear()
      maxDate = `${maxDate + 1}-01-01`
    }
    let formats = [moment.ISO_8601, 'YYYY-MM-DD']
    let startDate = moment().format('YYYY-MM-DD')

    if (moment(defDate, formats, true).isValid()) {
      startDate = defDate
    }

    if (this.state.goBackTrigger) {
      startDate = this.state.chosenDay
    }
    const nextDays = [startDate]
    let calAgendaObject = {}
    nextDays.forEach((day) => {
      calAgendaObject[day] = {
        selected: true,
      }
    })
    // agenda
    let eventBgColorPass = "red" //'#ffffff'
    let eventTextColorPass = '#000000'
    let agendaRenderPass = false
    this.state.agendaEvents = []
    if (items !== undefined && items[0] !== undefined) {
      let { eventBgColor, eventTextColor } = items[0].agenda
      eventBgColorPass = eventBgColor
      eventTextColorPass = eventTextColor
      let eventTitleArray = []
      let eventSubtitleArray = []
      let eventStarttimeArray = []
      let eventEndtimeArray = []
      let markedDatesArray = []
      for (let i = 0; i < items.length; ++i) {
        eventTitleArray.push(items[i].agenda.eventTitle)
        eventSubtitleArray.push(items[i].agenda.eventSubtitle)
        eventStarttimeArray.push(items[i].eventStarttime)
        eventEndtimeArray.push(items[i].eventEndtime)

        const startDate = new Date(eventStarttimeArray[i])
        const endDate = new Date(eventEndtimeArray[i])

        // Start Date
        const formattedStartDate = formatDate(startDate, false)
        const formattedStartDateWithTime = formatDate(startDate, true)

        // End Date
        const formattedEndDate = formatDate(endDate, false)
        const formattedEndDateWithTime = formatDate(endDate, true)

        const startTime = `${startDate.getFullYear()}-${
          startDate.getMonth() + 1
        }-${
          startDate.getDate() < 10
            ? `0${startDate.getDate()}`
            : `${startDate.getDate()}`
        }`

        const endTime = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${
          endDate.getDate() < 10
            ? `0${endDate.getDate()}`
            : `${endDate.getDate()}`
        }`

        // Marks single day events
        if (startTime === endTime) {
          // Marks date if start and end time are different
          if (formattedStartDateWithTime !== formattedEndDateWithTime) {
            this.pushAgendaEvents(
              this.state.agendaEvents,
              i,
              formattedStartDateWithTime,
              formattedEndDateWithTime,
              eventTitleArray[i],
              eventSubtitleArray[i]
            )
            markedDatesArray.push(formattedStartDate)
          }
          // Marks multiple days events
        } else {
          // Marks first day if the event ends before 23:59
          if (formattedStartDate + ' 23:59' !== formattedStartDateWithTime) {
            this.pushAgendaEvents(
              this.state.agendaEvents,
              i,
              formattedStartDateWithTime,
              formattedStartDate + ' 23:59',
              eventTitleArray[i],
              eventSubtitleArray[i]
            )

            markedDatesArray.push(formattedStartDate)
          }
          // new Date(endTime) is returning undefined here \/
          const dates = this.getDates(
            moment(startTime, 'YYYY-MM-DD').toDate(),
            moment(endTime, 'YYYY-MM-DD').toDate()
          )

          // Adds other marked dates (starts with 1 to avoid first day)
          for (let j = 1; j < dates.length - 1; ++j) {
            const datePush = formatDate(new Date(dates[j]), false)
            this.pushAgendaEvents(
              this.state.agendaEvents,
              i,
              datePush + ' 00:00',
              datePush + ' 23:59',
              eventTitleArray[i],
              eventSubtitleArray[i]
            )
            markedDatesArray.push(datePush)
          }
          // Marks last day if the event ends after 00:00
          if (formattedEndDate + ' 00:00' !== formattedEndDateWithTime) {
            this.pushAgendaEvents(
              this.state.agendaEvents,
              i,
              formattedEndDate + ' 00:00',
              formattedEndDateWithTime,
              eventTitleArray[i],
              eventSubtitleArray[i]
            )
            markedDatesArray.push(formattedEndDate)
          }
        }
      }
      if (items[0].eventStarttime === undefined) {
        let passDate = new Date(this.state.chosenDay)
        passDate.setDate(passDate.getDate() + 1)
        this.pushAgendaEvents(
          this.state.agendaEvents,
          0,
          formatDate(new Date(passDate), false) + ' 00:15',
          formatDate(new Date(passDate), false) + ' 5:15',
          'Example Title',
          'Example Subtitle'
        )
      }
      if (openAccordion === 'agenda') {
        agendaRenderPass = true
      }
      this.state.datesHash = new Map()
      for (let i = 0; i < markedDatesArray.length; ++i) {
        let count = 0
        for (let j = 0; j < markedDatesArray.length; ++j) {
          if (markedDatesArray[i] === markedDatesArray[j]) {
            count++
          }
        }
        this.state.datesHash.set(markedDatesArray[i], count)
      }
      if (markingStyle === 'multi-dot') {
        markedDatesArray.forEach((day) => {
          let selected = false
          if (day === startDate) {
            selected = true
          }
          calAgendaObject[day] = {
            dots: this.multiDotRender(
              this.state.datesHash.get(day),
              "white"
              //activeColor
            ),
            selected: true,
          }
        })
      } else {
        markedDatesArray.forEach((day) => {
          let selected = false
          if (day === startDate) {
            selected = true
          }
          calAgendaObject[day] = {
            periods: [
              { startingDay: false, endingDay: false, color: activeColor },
            ],
            selected: true,
          }
        })
      }
    }

    // pushAgendaEvents = (agendaEvents, i, start, end, title, subtitle) => {
    //   agendaEvents.push({
    //     id: i,
    //     start: start,
    //     end: end,
    //     title: title,
    //     summary: subtitle,
    //   })
    // }

    if (zapisi) {
      for (let i = 0; i < zapisi.length; i++) {

        const startTime = zapisi[i].zapisStartTime
        const endTime = zapisi[i].zapisEndTime

        if (startTime && endTime) {
          const formattedStartDateWithTime = formatDate(new Date(startTime), true)
          const formattedEndDateWithTime = formatDate(new Date(endTime), true)

          this.pushAgendaEvents(
            this.state.agendaEvents,
            i,
            formattedStartDateWithTime,
            formattedEndDateWithTime,
            "Zapis " + i,
            "Subtitle " + i
          )
        }        
      }
    }

    if (!(editor && agendaRenderPass) && this.state.calendarRender) {
      return (
        <View style={{ flex: 1, marginTop: 20 }}>
          <Calendar
            key={`${activeColor}${textColor}${disabledColor}${bgColor}${headingTextColor}${_height}`}
            theme={{
              currentDateColor: "red",
              calendarBackground: bgColor,
              textSectionTitleColor: textColor,
              selectedDayBackgroundColor: colors.currentDateColor,
              // selectedDayTextColor: activeColor,
              todayTextColor: textColor,
              dayTextColor: textColor,
              textDisabledColor: disabledColor,
              dotColor: activeColor,
              selectedDotColor: activeColor,
              monthTextColor: headingTextColor,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16,
              textDayFontFamily: customFontStyles.bodyFont.fontFamily,
              textMonthFontFamily: customFontStyles.bodyFont.fontFamily,
              'stylesheet.calendar.header': {
                dayHeader: {
                  marginTop: 2,
                  marginBottom: 7,
                  width: 50,
                  textAlign: 'center',
                  fontSize: appStyle.textDayHeaderFontSize,
                  fontWeight: 'bold',
                  color: textColor,
                  ...customFontStyles.bodyFont,
                },
              },
              // 'stylesheet.day.basic': {
              //   base: {
              //     height: this.props._height / 10,
              //     alignItems: 'center',
              //     textAlign: 'center',
              //   },
              // },
              // 'stylesheet.day.multiDot': {
              //   base: {
              //     height: this.props._height / 10,
              //     alignItems: 'center',
              //   },
              // },
            }}
            firstDay={mondayBeginBool}
            onDayPress={this.onDayPress}
            minDate={minDate}
            maxDate={maxDate}
            current={startDate}
            hideArrows={!changeMonths}
            renderArrow={(direction) => (
              <FontAwesomeIcon
                icon={direction === 'left' ? faChevronLeft : faChevronRight}
                color={activeColor}
              />
            )}
            onPressArrowLeft={(subtractMonth) => subtractMonth()}
            onPressArrowRight={(addMonth) => addMonth()}
            // markedDates={calAgendaObject}
            markedDates={objDates}
            markingType={markingStyle}
          />
        </View>
      )
    }

    return (
      <View style={{ flex: 1, marginTop: 20 }}>
        <EventCalendar
          {...this.props}
          title={passedTitle}
          headerColor={bgColor}
          headerTextColor={headingTextColor}
          eventBgColor={eventBgColorPass}
          eventTextColor={eventTextColorPass}
          activeColor={activeColor}
          customFontStyles={customFontStyles}
          key={`${bgColor}${headingTextColor}${eventBgColorPass}${eventTextColorPass}`}
          eventTapped={this.eventTapped}
          backButton={this.goBack}
          events={this.state.agendaEvents}
          width={this.props._width}
          initDate={this.state.chosenDay}
          scrollToFirst
          format24h={timeFormat}
        />
      </View>
    )
  }
}

export default DynamicCalendar
