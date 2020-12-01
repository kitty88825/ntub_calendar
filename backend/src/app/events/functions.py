from datetime import datetime

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from core import settings


class DateTimeMerge(object):
    def merge(self, intervals):
        """
        :type intervals: List[Interval]
        :rtype: List[Interval]
        """
        if len(intervals) == 0:
            return []

        self.quicksort(intervals, 0, len(intervals)-1)
        stack = []
        stack.append(intervals[0])
        for i in range(1, len(intervals)):
            last_element = stack[len(stack)-1]
            if last_element[1] >= intervals[i][0]:
                last_element[1] = max(intervals[i][1], last_element[1])
                stack.pop(len(stack)-1)
                stack.append(last_element)
            else:
                stack.append(intervals[i])

        return stack

    def partition(self, array, start, end):
        pivot_index = start
        for i in range(start, end):
            if array[i][0] <= array[end][0]:
                array[i], array[pivot_index] = array[pivot_index], array[i]
                pivot_index += 1

        array[end], array[pivot_index] = array[pivot_index], array[end]

        return pivot_index

    def quicksort(self, array, start, end):
        if start < end:
            partition_index = self.partition(array, start, end)
            self.quicksort(array, start, partition_index-1)
            self.quicksort(array, partition_index+1, end)


def datetime_to_timestamp(data: list):
    if not data:
        return

    response = []
    for d in data:
        response.append([d['start_at'].timestamp(), d['end_at'].timestamp()])

    return response


def timestamp_to_datetime(data: list):
    if not data:
        return

    response = []
    for d in data:
        response.append([
            datetime.fromtimestamp(d[0]),
            datetime.fromtimestamp(d[1]),
        ])

    return response


def get_free_time(data: list, start_at: str, end_at: str):
    response = []
    time_list = [k for d in data for k in d]
    s_list = time_list[::2]
    e_list = time_list[1::2]

    s_list.append(datetime.fromisoformat(end_at).timestamp())
    e_list.insert(0, datetime.fromisoformat(start_at).timestamp())
    for i in range(len(s_list)):
        if s_list[i] - e_list[i] > 1800:
            response.append([e_list[i], s_list[i]])

    if not response:
        return 'No suggested time!'

    return timestamp_to_datetime(response)


def send_email(instance, participants):
    from_email = settings.EMAIL_HOST_USER
    try:
        datetime_format = '%Y/%m/%d %H:%M'
        subject, to = instance.title, participants.email
        text_content = '北商資管系專題109405組一訂行系統發送會議邀請信件！'
        context = {
            'title': instance.title,
            'start_at': instance.start_at.strftime(datetime_format),
            'end_at': instance.end_at.strftime(datetime_format),
            'participants': instance.participants.all(),
            'description': instance.description,
            'location': instance.location,
            'url': settings.BACKEND_URL,
            'code': participants.verification_code,
            'eid': instance.id,
        }
        html_content = render_to_string('email.html', context)
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, 'text/html')
        msg.send()
        print(f'已發送信件給！{participants}')
    except Exception as e:
        print(f'發信錯誤：{e}')
