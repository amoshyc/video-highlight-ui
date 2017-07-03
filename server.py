import argparse
import pathlib
import multiprocessing
import json
import sys

import tornado.ioloop
import tornado.web
import tornado.escape

from moviepy.editor import VideoFileClip, concatenate_videoclips

clip_process = None
video_src = None
video_type = None


def clip(starts, ends):
    video = VideoFileClip(video_src)
    clips = [video.subclip(s, e) for s, e in zip(starts, ends)]
    result = concatenate_videoclips(clips)
    result_path = pathlib.Path(video_src).parent / 'clip.{}'.format(video_type)
    result.write_videofile(str(result_path), write_logfile=True)


class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        self.render(
            'templates/index.html', video_src=video_src, video_type=video_type)


class ClipTriggerHandler(tornado.web.RequestHandler):
    def post(self):
        arg = tornado.escape.json_decode(self.request.body)
        starts = map(float, arg['starts'])
        ends = map(float, arg['ends'])

        log_file = pathlib.Path(video_src).with_suffix('.txt')
        with open(str(log_file), 'w') as f:
            data = ['{} {}'.format(s, e) for s, e in zip(starts, ends)]
            f.write('\n'.join(data))

        clip_process = multiprocessing.Process(
            target=clip, args=(starts, ends))
        clip_process.start()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('path', help="path/to/video")
    args = parser.parse_args()

    global video_src
    global video_type

    path = pathlib.Path(args.path).expanduser().absolute()

    if not path.exists():
        print('Error: "{}" not exists'.format(path))
        print('Program exits.')
        return
    if path.suffix.lower() not in ('.mp4', '.webm', '.ogg'):
        print('Error: "{}" is not supported'.format(path.suffix))
        print('Program exits.')
        return

    # prevent path start from root to cause url has double slash
    video_src = str(path)
    video_type = path.suffix[1:]

    app = tornado.web.Application(
        [(r'/', IndexHandler),
         (r'/static/(.*)', tornado.web.StaticFileHandler, {
             'path': './static'
         }), (r'/local/@(.*)', tornado.web.StaticFileHandler, {
             'path': str(path.parent)
         }), (r'/clip_trigger', ClipTriggerHandler)])

    app.listen(8787)
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()