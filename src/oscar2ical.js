"use strict";

import $ from 'jquery';
import moment from 'moment';
import ical from 'ical-generator';
import {saveAs} from 'file-saver';

var timeFormat = "hh:mm a";
var dateFormat = "MMM DD, YYYY";

if ($(".pagebodydiv").text().trim().startsWith("Total Credit Hours")) {
    $(".pagetitlediv").find("h2").eq(0).append("<a id=\"downloadButton\" class=\"oscar2ical-button oscar2ical-button_primary\">Download calendar</a><br>");
}

function readPageAsICal() {
    var cal = ical({
        domain: 'oscar.gatech.edu',
        prodId: {company: 'oscar.gatech.edu', product: 'student-schedule'},
        name: 'Student Schedule',
        timezone: 'America/New_York'
    });

    $('.datadisplaytable:even').each(function(){
        var courseData = $(this);
        var scheduleData = courseData.next('.datadisplaytable');

        var name = courseData.find("caption").text();
        var infoArray = [];

        courseData.find("tr").each(function() {
            var text = "";
            $(this).children("td").each(function() {
                text += $(this).text().trim();
            })

            infoArray.push(text);
        })
        var info = infoArray.join("\n");

        // Try to parse the schedule now
        var events = [];
        scheduleData.find("tr").not(":first").each(function() {
            var columns = $(this).children("td");

            var location = columns.eq(3).text();

            var dateStr = columns.eq(4).text();
            var dateArr = dateStr.split(" - ");
            if (dateArr.length != 2) return;

            var fromDate = moment(dateArr[0], dateFormat).startOf('day');
            var toDate = moment(dateArr[1], dateFormat).endOf('day');

            var dayStr = columns.eq(2).text().toUpperCase();
            var days = [];

            if (dayStr.includes("M")) days.push('mo');
            if (dayStr.includes("T")) days.push('tu');
            if (dayStr.includes("W")) days.push('we');
            if (dayStr.includes("R")) days.push('th');
            if (dayStr.includes("F")) days.push('fr');
            // TODO: if (dayStr.includes("S")) days.push(RRule.SA);
            // TODO: if (dayStr.includes("Su")) days.push(RRule.SU);

            var timeStr = columns.eq(1).text();
            var timeArr = timeStr.split(" - ");
            if (timeArr.length != 2) return;

            var fromTime = moment(timeArr[0], timeFormat);
            var toTime = moment(timeArr[1], timeFormat);

            // Find the first session
            var firstDay = moment(days[0], "dd");
            var firstSessionBegin = fromDate.clone().day(firstDay.day()).hour(fromTime.hour()).minute(fromTime.minute());
            var firstSessionEnd = firstSessionBegin.clone().add(moment.duration(toTime.diff(fromTime)));

            cal.createEvent({
                start: firstSessionBegin.toDate(),
                end: firstSessionEnd.toDate(),
                timestamp: new Date(),
                summary: name,
                description: info,
                location: location,
                repeating: {
                    freq: 'WEEKLY',
                    until: toDate.toDate(),
                    byDay: days
                }
            });
        });
    });

    var blob = new Blob([cal.toString()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "schedule.ics");
}

$("#downloadButton").on("click", readPageAsICal);
